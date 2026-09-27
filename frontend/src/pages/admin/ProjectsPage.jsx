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
import { projectsApi } from '../../services/endpoints';
import { formatDate } from '../../utils/format';
import { imageSrc } from '../../utils/image';

const PAGE_SIZE = 10;

/**
 * Admin project list: portfolio case studies with search, category and
 * status filtering plus featured / visibility / delete actions.
 */
export default function ProjectsPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Projects | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      projectsApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        category: category || undefined,
        status: status || undefined,
        includeInactive: 'true',
        sort: 'sortOrder -completionDate -createdAt',
      }),
    [page, debouncedSearch, category, status]
  );

  const { data: usedCategories } = useApi(() => projectsApi.listCategories(), []);

  const items = data?.items || [];
  const meta = data?.meta || null;
  const categories = Array.isArray(usedCategories) ? usedCategories : [];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status]);

  const handleToggleFeatured = async (project) => {
    try {
      await projectsApi.toggleFeatured(project._id);
      toast.success(project.featured ? 'Removed from featured.' : 'Marked as featured.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the project.');
    }
  };

  const handleToggleActive = async (project) => {
    try {
      await projectsApi.toggle(project._id);
      toast.success(project.isActive ? 'Project hidden from the website.' : 'Project published.');
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the project.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectsApi.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the project.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load projects" message={error.message} onRetry={() => reload()} />
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
              placeholder="Search projects…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search projects"
            />
          </div>
          <select
            className="admin-select"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
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
        <Button to="/admin/projects/new" variant="accent" icon="plus">
          Add Project
        </Button>
      </div>

      <div className="panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Category</th>
                <th>Completed</th>
                <th>Featured</th>
                <th>Status</th>
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
                      icon="briefcase"
                      title="No projects found"
                      message={
                        debouncedSearch || category || status
                          ? 'Try adjusting your search or filters.'
                          : 'Showcase your completed work to build trust with new customers.'
                      }
                      action={
                        <Button to="/admin/projects/new" variant="accent" size="sm" icon="plus">
                          Add Project
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((project) => (
                  <tr key={project._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <img
                          className="admin-table__thumb"
                          src={imageSrc(project.coverImage)}
                          alt=""
                          loading="lazy"
                        />
                        <span style={{ minWidth: 0 }}>
                          <span className="admin-table__title">{project.name}</span>
                          <span className="admin-table__sub">{project.location || `/${project.slug}`}</span>
                        </span>
                      </div>
                    </td>
                    <td>{project.category || '—'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {project.completionDate ? formatDate(project.completionDate, { month: 'long' }) : '—'}
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`icon-btn${project.featured ? ' icon-btn--active' : ''}`}
                        onClick={() => handleToggleFeatured(project)}
                        title={project.featured ? 'Remove from featured' : 'Mark as featured'}
                        aria-label="Toggle featured"
                      >
                        <Icon name="star" size={17} />
                      </button>
                    </td>
                    <td>
                      <span className={`badge badge--${project.isActive ? 'success' : 'neutral'}`}>
                        {project.isActive ? 'Published' : 'Hidden'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <Link
                          className="icon-btn"
                          to={`/admin/projects/${project._id}/edit`}
                          title="Edit project"
                          aria-label={`Edit ${project.name}`}
                        >
                          <Icon name="edit" size={17} />
                        </Link>
                        <a
                          className="icon-btn"
                          href={`/projects/${project.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on website"
                          aria-label={`View ${project.name} on the website`}
                        >
                          <Icon name="external-link" size={17} />
                        </a>
                        <button
                          type="button"
                          className={`icon-btn${project.isActive ? '' : ' icon-btn--accent'}`}
                          onClick={() => handleToggleActive(project)}
                          title={project.isActive ? 'Hide from website' : 'Publish'}
                          aria-label="Toggle visibility"
                        >
                          <Icon name={project.isActive ? 'eye' : 'eye-off'} size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(project)}
                          title="Delete project"
                          aria-label={`Delete ${project.name}`}
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
        title="Delete project"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the portfolio and the website.`
            : ''
        }
        confirmLabel="Delete project"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
