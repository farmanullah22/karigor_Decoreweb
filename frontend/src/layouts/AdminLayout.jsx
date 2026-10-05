import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import Icon from '../components/common/Icon';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { dashboardApi } from '../services/endpoints';
import { getInitials } from '../utils/format';
import { resolveImageUrl } from '../utils/image';

/**
 * Navigation groups for the dashboard sidebar. Each item knows how to
 * detect whether it is the active route (prefix match for nested pages).
 */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: '/admin', end: true, icon: 'dashboard', label: 'Dashboard' }],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products', icon: 'package', label: 'Products', singular: 'product' },
      { to: '/admin/categories', icon: 'folder', label: 'Categories' },
      { to: '/admin/services', icon: 'tool', label: 'Services', singular: 'service' },
    ],
  },
  {
    label: 'Portfolio',
    items: [{ to: '/admin/projects', icon: 'briefcase', label: 'Projects', singular: 'project' }],
  },
  {
    label: 'Customers',
    items: [
      { to: '/admin/inquiries', icon: 'inbox', label: 'Inquiries', badgeKey: 'newInquiries' },
      { to: '/admin/quotes', icon: 'file-text', label: 'Quote Requests', badgeKey: 'pendingQuotes' },
      { to: '/admin/customers', icon: 'users', label: 'Customers / Leads' },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/homepage', icon: 'home', label: 'Homepage' },
      { to: '/admin/settings', icon: 'settings', label: 'Company Settings' },
      { to: '/admin/media', icon: 'image', label: 'Media Library' },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/admin/profile', icon: 'user', label: 'Profile' },
      { to: '/admin/change-password', icon: 'key', label: 'Change Password' },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

/** Matches the current pathname to a nav item and derives the page title. */
function usePageTitle(pathname) {
  const item = ALL_ITEMS.find((entry) =>
    entry.end ? pathname === entry.to : pathname === entry.to || pathname.startsWith(`${entry.to}/`)
  );

  if (!item) return 'Dashboard';
  if (pathname.endsWith('/new') && item.singular) {
    return `New ${item.singular.charAt(0).toUpperCase()}${item.singular.slice(1)}`;
  }
  if (pathname.endsWith('/edit') && item.singular) {
    return `Edit ${item.singular.charAt(0).toUpperCase()}${item.singular.slice(1)}`;
  }
  return item.label;
}

/** Admin dashboard shell: fixed sidebar, sticky header, routed content area. */
export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const { settings } = useSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lightweight stats fetch for sidebar badges (new inquiries / pending quotes).
  const { data: stats } = useApi(() => dashboardApi.stats(), [pathname]);
  const badges = stats?.totals || {};

  const pageTitle = usePageTitle(pathname);

  // Close the mobile sidebar whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="admin-shell">
      {/* ---------------- Sidebar ---------------- */}
      <aside className={`admin-sidebar${sidebarOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <span className="brand__mark" aria-hidden="true">
            {(settings.companyName || 'KD')
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span>
            <span className="admin-sidebar__brand-name">
              {settings.companyName || 'Decora'}
            </span>
            <span className="admin-sidebar__brand-sub">Admin Panel</span>
          </span>
        </div>

        <nav className="admin-sidebar__nav" aria-label="Dashboard navigation">
          {NAV_GROUPS.map((group) => (
            <div className="admin-nav-group" key={group.label}>
              <div className="admin-nav-group__label">{group.label}</div>
              {group.items.map((item) => {
                const badge = item.badgeKey ? badges[item.badgeKey] : 0;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`}
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{item.label}</span>
                    {badge > 0 ? <span className="admin-nav-link__badge">{badge}</span> : null}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <Link to="/admin/profile" className="admin-sidebar__user">
            <span className="admin-avatar">
              {admin?.avatar ? (
                <img src={resolveImageUrl(admin.avatar)} alt="" />
              ) : (
                getInitials(admin?.name || 'Admin')
              )}
            </span>
            <span style={{ minWidth: 0 }}>
              <span className="admin-sidebar__user-name">{admin?.name || 'Administrator'}</span>
              <span className="admin-sidebar__user-role">{admin?.role || 'admin'}</span>
            </span>
          </Link>
          <button
            type="button"
            className="admin-nav-link"
            style={{ width: '100%', marginTop: 6 }}
            onClick={handleLogout}
          >
            <Icon name="log-out" size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for the mobile sidebar */}
      <div
        className={`admin-sidebar__backdrop${sidebarOpen ? ' admin-sidebar__backdrop--visible' : ''}`}
        role="presentation"
        onClick={() => setSidebarOpen(false)}
      />

      {/* ---------------- Main area ---------------- */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="admin-header__left">
            <button
              type="button"
              className="admin-burger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Icon name="menu" size={20} />
            </button>
            <h1 className="admin-header__title">{pageTitle}</h1>
          </div>
          <div className="admin-header__actions">
            <a
              className="admin-header__link"
              href="/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="external-link" size={16} />
              <span>View Website</span>
            </a>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
