import { Link } from 'react-router-dom';

import BarChart from '../../components/admin/BarChart';
import StatCard from '../../components/admin/StatCard';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import StatusBadge from '../../components/common/StatusBadge';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { dashboardApi } from '../../services/endpoints';
import { INQUIRY_STATUSES, QUOTE_STATUSES } from '../../utils/constants';
import { timeAgo } from '../../utils/format';

/**
 * Dashboard overview: live counters from the database, a six-month
 * inquiries/quotes chart, catalog distribution and the latest customer
 * requests. Everything here is computed from real records — no mock data.
 */
export default function DashboardPage() {
  const { admin } = useAuth();
  const { data, loading, error, reload } = useApi(() => dashboardApi.stats());

  useDocumentMeta({ title: 'Dashboard | Admin' });

  if (loading) return <LoadingBlock label="Loading dashboard…" minHeight="50vh" />;

  if (error || !data) {
    return (
      <ErrorState
        title="Could not load dashboard"
        message={error?.message || 'Please try again in a moment.'}
        onRetry={() => reload()}
      />
    );
  }

  const { totals, monthly = [], productsByCategory = [], recentInquiries = [], recentQuotes = [] } = data;
  const maxCategoryCount = Math.max(1, ...productsByCategory.map((item) => item.count || 0));

  return (
    <>
      {/* Greeting + quick actions */}
      <div className="admin-toolbar">
        <div>
          <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-ink)' }}>
            Welcome back{admin?.name ? `, ${admin.name.split(' ')[0]}` : ''}
          </h2>
          <p style={{ color: 'var(--color-muted)', fontSize: 'var(--text-sm)', marginTop: 4 }}>
            Here is what is happening with your business today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          <Button to="/admin/products/new" variant="secondary" size="sm" icon="plus">
            New Product
          </Button>
          <Button to="/admin/projects/new" variant="accent" size="sm" icon="plus">
            New Project
          </Button>
        </div>
      </div>

      {/* Key counters */}
      <div className="stat-grid">
        <StatCard icon="package" label="Products" value={totals.products} sub={`${totals.categories} categories`} />
        <StatCard icon="tool" label="Services" value={totals.services} sub="Offered to customers" />
        <StatCard icon="briefcase" label="Projects" value={totals.projects} sub="In the portfolio" />
        <StatCard icon="inbox" label="Inquiries" value={totals.inquiries} sub={`${totals.newInquiries} new`} />
        <StatCard icon="file-text" label="Quote Requests" value={totals.quoteRequests} sub={`${totals.pendingQuotes} pending`} />
        <StatCard icon="users" label="Customers / Leads" value={totals.customers} sub={`${totals.media} media files`} />
      </div>

      {/* Chart + catalog distribution */}
      <div className="dashboard-grid dashboard-grid--wide">
        <div className="panel">
          <div className="panel__header">
            <div>
              <div className="panel__title">Customer Requests</div>
              <div className="panel__subtitle">Inquiries and quote requests over the last 6 months</div>
            </div>
          </div>
          <div className="panel__body">
            <BarChart data={monthly} />
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Products by Category</div>
            <Link to="/admin/categories" className="panel__link">
              Manage categories
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          <div className="panel__body">
            {productsByCategory.length === 0 ? (
              <div className="panel-empty">No products yet.</div>
            ) : (
              <div className="hbar-list">
                {productsByCategory.map((item) => (
                  <div className="hbar-item" key={item.name || 'uncategorized'}>
                    <div className="hbar-item__top">
                      <span className="hbar-item__name">{item.name || 'Uncategorized'}</span>
                      <span className="hbar-item__count">{item.count}</span>
                    </div>
                    <div className="hbar-item__track">
                      <div
                        className="hbar-item__fill"
                        style={{ width: `${((item.count || 0) / maxCategoryCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Latest requests */}
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Latest Inquiries</div>
            <Link to="/admin/inquiries" className="panel__link">
              View all
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          {recentInquiries.length === 0 ? (
            <div className="panel-empty">No inquiries yet.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInquiries.map((inquiry) => (
                    <tr key={inquiry._id}>
                      <td>
                        <span className="admin-table__title">{inquiry.name}</span>
                        <span className="admin-table__sub">{inquiry.phone}</span>
                      </td>
                      <td>{inquiry.subject || inquiry.service || 'General'}</td>
                      <td>
                        <StatusBadge map={INQUIRY_STATUSES} value={inquiry.status} />
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{timeAgo(inquiry.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel__header">
            <div className="panel__title">Latest Quote Requests</div>
            <Link to="/admin/quotes" className="panel__link">
              View all
              <Icon name="arrow-right" size={14} />
            </Link>
          </div>
          {recentQuotes.length === 0 ? (
            <div className="panel-empty">No quote requests yet.</div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table" style={{ minWidth: 0 }}>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>For</th>
                    <th>Status</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {recentQuotes.map((quote) => (
                    <tr key={quote._id}>
                      <td>
                        <span className="admin-table__title">{quote.name}</span>
                        <span className="admin-table__sub">{quote.phone}</span>
                      </td>
                      <td>{quote.productService || 'Custom requirement'}</td>
                      <td>
                        <StatusBadge map={QUOTE_STATUSES} value={quote.status} />
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>{timeAgo(quote.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
