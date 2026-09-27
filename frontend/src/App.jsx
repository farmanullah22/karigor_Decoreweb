import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import RequireAuth from './components/admin/RequireAuth';

// Public pages (eager: they are the most frequently visited).
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ProductsPage from './pages/public/ProductsPage';
import ProductDetailPage from './pages/public/ProductDetailPage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailPage from './pages/public/ServiceDetailPage';
import ProjectsPage from './pages/public/ProjectsPage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import ContactPage from './pages/public/ContactPage';
import QuotePage from './pages/public/QuotePage';
import NotFoundPage from './pages/public/NotFoundPage';

// Admin pages are lazy-loaded so the public bundle stays lean.
const AdminLoginPage = lazy(() => import('./pages/admin/LoginPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/ProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/ProductFormPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/CategoriesPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/ServicesPage'));
const AdminServiceFormPage = lazy(() => import('./pages/admin/ServiceFormPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/ProjectsPage'));
const AdminProjectFormPage = lazy(() => import('./pages/admin/ProjectFormPage'));
const AdminInquiriesPage = lazy(() => import('./pages/admin/InquiriesPage'));
const AdminQuotesPage = lazy(() => import('./pages/admin/QuotesPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/CustomersPage'));
const AdminMediaPage = lazy(() => import('./pages/admin/MediaPage'));
const AdminHomepagePage = lazy(() => import('./pages/admin/HomepagePage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/ProfilePage'));
const AdminChangePasswordPage = lazy(() => import('./pages/admin/ChangePasswordPage'));

/** Scrolls to the top whenever the route changes. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname]);
  return null;
}

function AdminFallback() {
  return (
    <div className="loading-block" style={{ minHeight: '60vh' }}>
      <span className="spinner" />
      <span>Loading dashboard…</span>
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* ---------- Public website ---------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/quote" element={<QuotePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ---------- Admin ---------- */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminFallback />}>
              <AdminLoginPage />
            </Suspense>
          }
        />
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route
            index
            element={
              <Suspense fallback={<AdminFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="products"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProductsPage />
              </Suspense>
            }
          />
          <Route
            path="products/new"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProductFormPage />
              </Suspense>
            }
          />
          <Route
            path="products/:id/edit"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProductFormPage />
              </Suspense>
            }
          />
          <Route
            path="categories"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminCategoriesPage />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminServicesPage />
              </Suspense>
            }
          />
          <Route
            path="services/new"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminServiceFormPage />
              </Suspense>
            }
          />
          <Route
            path="services/:id/edit"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminServiceFormPage />
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProjectsPage />
              </Suspense>
            }
          />
          <Route
            path="projects/new"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProjectFormPage />
              </Suspense>
            }
          />
          <Route
            path="projects/:id/edit"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProjectFormPage />
              </Suspense>
            }
          />
          <Route
            path="inquiries"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminInquiriesPage />
              </Suspense>
            }
          />
          <Route
            path="quotes"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminQuotesPage />
              </Suspense>
            }
          />
          <Route
            path="customers"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminCustomersPage />
              </Suspense>
            }
          />
          <Route
            path="media"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminMediaPage />
              </Suspense>
            }
          />
          <Route
            path="homepage"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminHomepagePage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminSettingsPage />
              </Suspense>
            }
          />
          <Route
            path="profile"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminProfilePage />
              </Suspense>
            }
          />
          <Route
            path="change-password"
            element={
              <Suspense fallback={<AdminFallback />}>
                <AdminChangePasswordPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </>
  );
}
