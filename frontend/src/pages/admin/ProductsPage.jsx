import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { categoriesApi, productsApi } from '../../services/endpoints';
import { formatDate } from '../../utils/format';
import { imageSrc } from '../../utils/image';

const PAGE_SIZE = 10;

/**
 * Admin product list: server-side search / category / status filtering,
 * inline featured + visibility toggles, soft delete with confirmation.
 */
export default function ProductsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Products | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      productsApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        includeInactive: 'true',
        sort: 'sortOrder -createdAt',
      }),
    [page, debouncedSearch, category, status]
  );

  const { data: categoriesData } = useApi(
    () => categoriesApi.list({ scope: 'product', limit: 100, includeInactive: 'true' }),
    []
  );

  const items = data?.items || [];
  const meta = data?.meta || null;
  const categories = categoriesData?.items || [];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  const handleToggleFeatured = async (product) => {
    try {
      await productsApi.toggleFeatured(product._id);
      toast.success(product.featured ? 'Removed from featured.' : 'Marked as featured.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the product.');
    }
  };

  const handleToggleActive = async (product) => {
    try {
      await productsApi.toggle(product._id);
      toast.success(product.isActive ? 'Product hidden from the website.' : 'Product published.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the product.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await productsApi.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the product.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Could not load products"
        message={error.message}
        onRetry={() => reload()}
      />
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
              placeholder="Search products…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search products"
            />
          </div>
          <select
            className="admin-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item._id} value={item.slug}>
                {item.name}
              </option>
            ))}
          </select>
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
        <Button to="/admin/products/new" variant="accent" icon="plus">
          Add Product
        </Button>
      </div>

      <div className="panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Status</th>
                <th>Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={6} columns={6} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 0 }}>
                    <EmptyState
                      icon="package"
                      title="No products found"
                      message={
                        debouncedSearch || category || status
                          ? 'Try adjusting your search or filters.'
                          : 'Add your first product to get started.'
                      }
                      action={
                        <Button to="/admin/products/new" variant="accent" size="sm" icon="plus">
                          Add Product
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr key={product._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <img
                          className="admin-table__thumb"
                          src={imageSrc(product.image)}
                          alt=""
                          loading="lazy"
                        />
                        <span style={{ minWidth: 0 }}>
                          <span className="admin-table__title">{product.name}</span>
                          <span className="admin-table__sub">/{product.slug}</span>
                        </span>
                      </div>
                    </td>
                    <td>{product.category?.name || '—'}</td>
                    <td>
                      <button
                        type="button"
                        className={`icon-btn${product.featured ? ' icon-btn--active' : ''}`}
                        onClick={() => handleToggleFeatured(product)}
                        title={product.featured ? 'Remove from featured' : 'Mark as featured'}
                        aria-label="Toggle featured"
                      >
                        <Icon name="star" size={17} />
                      </button>
                    </td>
                    <td>
                      <span className={`badge badge--${product.isActive ? 'success' : 'neutral'}`}>
                        {product.isActive ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(product.updatedAt)}</td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          className="icon-btn"
                          to={`/admin/products/${product._id}/edit`}
                          title="Edit product"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Icon name="edit" size={17} />
                        </Link>
                        <a
                          className="icon-btn"
                          href={`/products/${product.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on website"
                          aria-label={`View ${product.name} on the website`}
                        >
                          <Icon name="external-link" size={17} />
                        </a>
                        <button
                          type="button"
                          className={`icon-btn${product.isActive ? '' : ' icon-btn--accent'}`}
                          onClick={() => handleToggleActive(product)}
                          title={product.isActive ? 'Hide from website' : 'Publish'}
                          aria-label="Toggle visibility"
                        >
                          <Icon name={product.isActive ? 'eye' : 'eye-off'} size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(product)}
                          title="Delete product"
                          aria-label={`Delete ${product.name}`}
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
        title="Delete product"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the website and the catalog. This can't be undone from the dashboard.`
            : ''
        }
        confirmLabel="Delete product"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
