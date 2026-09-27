import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/common/States';
import ServiceIcon from '../../components/public/ServiceIcon';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { servicesApi } from '../../services/endpoints';
import { formatDate } from '../../utils/format';

const PAGE_SIZE = 10;

/**
 * Admin service list with the same management tools as products:
 * search, filtering, featured/visibility toggles and soft delete.
 */
export default function ServicesPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Services | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      servicesApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        includeInactive: 'true',
        sort: 'sortOrder -createdAt',
      }),
    [page, debouncedSearch, status]
  );

  const items = data?.items || [];
  const meta = data?.meta || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const handleToggleFeatured = async (service) => {
    try {
      await servicesApi.toggleFeatured(service._id);
      toast.success(service.featured ? 'Removed from featured.' : 'Marked as featured.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the service.');
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await servicesApi.toggle(service._id);
      toast.success(service.isActive ? 'Service hidden from the website.' : 'Service published.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the service.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await servicesApi.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the service.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load services" message={error.message} onRetry={() => reload()} />
    );
  }

  return (
    <>
      <div className="admin-toolbar">
        <div className="admin-toolbar__filters">
          <div className="admin-search">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search services…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search services"
            />
          </div>
          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="active">Published</option>
            <option value="inactive">Hidden</option>
          </select>
        </div>
        <Button to="/admin/services/new" variant="accent" icon="plus">
          Add Service
        </Button>
      </div>

      <div className="panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={6} columns={5} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <EmptyState
                      icon="tool"
                      title="No services found"
                      message={
                        debouncedSearch || status
                          ? 'Try adjusting your search or filters.'
                          : 'Describe the services you offer so customers can request them.'
                      }
                      action={
                        <Button to="/admin/services/new" variant="accent" size="sm" icon="plus">
                          Add Service
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((service) => (
                  <tr key={service._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <span
                          className="stat-card__icon"
                          style={{ width: 40, height: 40 }}
                          aria-hidden="true"
                        >
                          <ServiceIcon icon={service.icon} size={19} />
                        </span>
                        <span style={{ minWidth: 0 }}>
                          <span className="admin-table__title">{service.name}</span>
                          <span className="admin-table__sub">
                            {service.shortDescription || `/${service.slug}`}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`icon-btn${service.featured ? ' icon-btn--active' : ''}`}
                        onClick={() => handleToggleFeatured(service)}
                        title={service.featured ? 'Remove from featured' : 'Mark as featured'}
                        aria-label="Toggle featured"
                      >
                        <Icon name="star" size={17} />
                      </button>
                    </td>
                    <td>
                      <span className={`badge badge--${service.isActive ? 'success' : 'neutral'}`}>
                        {service.isActive ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(service.updatedAt)}</td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          className="icon-btn"
                          to={`/admin/services/${service._id}/edit`}
                          title="Edit service"
                          aria-label={`Edit ${service.name}`}
                        >
                          <Icon name="edit" size={17} />
                        </Link>
                        <a
                          className="icon-btn"
                          href={`/services/${service.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on website"
                          aria-label={`View ${service.name} on the website`}
                        >
                          <Icon name="external-link" size={17} />
                        </a>
                        <button
                          type="button"
                          className={`icon-btn${service.isActive ? '' : ' icon-btn--accent'}`}
                          onClick={() => handleToggleActive(service)}
                          title={service.isActive ? 'Hide from website' : 'Publish'}
                          aria-label="Toggle visibility"
                        >
                          <Icon name={service.isActive ? 'eye' : 'eye-off'} size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(service)}
                          title="Delete service"
                          aria-label={`Delete ${service.name}`}
                        >
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta && meta.totalPages > 1 ? (
        <div style={{ marginTop: 'var(--space-5)', display: 'flex', justifyContent: 'center' }}>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete service"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the website and the services list.`
            : ''
        }
        confirmLabel="Delete service"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
