import { useEffect, useState } from 'react';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import ImagePicker from '../../components/admin/ImagePicker';
import SwitchField from '../../components/admin/SwitchField';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { categoriesApi } from '../../services/endpoints';

const EMPTY_FORM = {
  name: '',
  scope: 'product',
  description: '',
  image: null,
  isActive: true,
  sortOrder: 0,
};

const SCOPE_LABELS = { product: 'Products', project: 'Projects' };

/**
 * Category management: create and edit categories in a modal, control
 * whether they group products or projects, reorder and deactivate.
 */
export default function CategoriesPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState('');
  const [editing, setEditing] = useState(null); // category being edited | 'new' | null
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Categories | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      categoriesApi.list({
        page,
        limit: 15,
        search: debouncedSearch || undefined,
        scope: scope || undefined,
        includeInactive: 'true',
        sort: 'sortOrder name',
      }),
    [page, debouncedSearch, scope]
  );

  const items = data?.items || [];
  const meta = data?.meta || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, scope]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setEditing('new');
  };

  const openEdit = (category) => {
    setForm({
      name: category.name || '',
      scope: category.scope || 'product',
      description: category.description || '',
      image: category.image || null,
      isActive: Boolean(category.isActive),
      sortOrder: category.sortOrder || 0,
    });
    setFieldErrors({});
    setEditing(category);
  };

  const closeModal = () => {
    if (saving) return;
    setEditing(null);
  };

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSave = async () => {
    const name = form.name.trim();
    if (name.length < 2 || name.length > 80) {
      setFieldErrors({ name: 'Category name is required (2-80 characters).' });
      return;
    }
    setFieldErrors({});

    const payload = {
      ...form,
      name,
      description: form.description.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      image: form.image?.url ? { url: form.image.url, alt: form.image.alt || '' } : null,
    };

    setSaving(true);
    try {
      if (editing === 'new') {
        await categoriesApi.create(payload);
        toast.success('Category created successfully.');
      } else {
        await categoriesApi.update(editing._id, payload);
        toast.success('Category updated successfully.');
      }
      setEditing(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not save the category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await categoriesApi.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the category.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load categories" message={error.message} onRetry={() => reload()} />
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
              placeholder="Search categories…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search categories"
            />
          </div>
          <select
            className="admin-select"
            value={scope}
            onChange={(event) => setScope(event.target.value)}
            aria-label="Filter by scope"
          >
            <option value="">All scopes</option>
            <option value="product">Products</option>
            <option value="project">Projects</option>
          </select>
        </div>
        <Button variant="accent" icon="plus" onClick={openCreate}>
          Add Category
        </Button>
      </div>

      <div className="panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Applies To</th>
                <th>Sort</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows count={5} columns={5} />
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 0 }}>
                    <EmptyState
                      icon="folder"
                      title="No categories found"
                      message={
                        debouncedSearch || scope
                          ? 'Try adjusting your search or filters.'
                          : 'Create categories to organize your products and projects.'
                      }
                      action={
                        <Button variant="accent" size="sm" icon="plus" onClick={openCreate}>
                          Add Category
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <span className="admin-table__title">{category.name}</span>
                      <span className="admin-table__sub">/{category.slug}</span>
                    </td>
                    <td>
                      <span className="badge badge--neutral">
                        {SCOPE_LABELS[category.scope] || category.scope}
                      </span>
                    </td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <span className={`badge badge--${category.isActive ? 'success' : 'neutral'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openEdit(category)}
                          title="Edit category"
                          aria-label={`Edit ${category.name}`}
                        >
                          <Icon name="edit" size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(category)}
                          title="Delete category"
                          aria-label={`Delete ${category.name}`}
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

      {/* -------- Create / edit modal -------- */}
      <Modal
        open={Boolean(editing)}
        title={editing === 'new' ? 'New Category' : 'Edit Category'}
        subtitle="Categories power the filters customers use on the website."
        onClose={closeModal}
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="accent" onClick={handleSave} loading={saving} icon="check">
              {editing === 'new' ? 'Create Category' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div className="form-grid" style={{ gap: 'var(--space-4)' }}>
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="category-name">
              Name <span className="required">*</span>
            </label>
            <input
              id="category-name"
              className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
              type="text"
              maxLength={80}
              placeholder="e.g. Aluminum Windows"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              autoFocus
            />
            {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="category-scope">
              Applies to
            </label>
            <select
              id="category-scope"
              className="form-select"
              value={form.scope}
              onChange={(event) => update('scope', event.target.value)}
            >
              <option value="product">Products</option>
              <option value="project">Projects</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="category-sort">
              Sort order
            </label>
            <input
              id="category-sort"
              className="form-input"
              type="number"
              min={0}
              max={9999}
              value={form.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="category-description">
              Description
            </label>
            <textarea
              id="category-description"
              className="form-textarea"
              rows={3}
              maxLength={500}
              placeholder="Optional — briefly explain what belongs in this category."
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>

          <ImagePicker
            label="Category image (optional)"
            value={form.image}
            onChange={(image) => update('image', image)}
          />

          <div className="form-field form-field--full">
            <SwitchField
              label="Active (visible on the website)"
              checked={form.isActive}
              onChange={(value) => update('isActive', value)}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. Products or projects in this category keep their data but lose the tag.`
            : ''
        }
        confirmLabel="Delete category"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
