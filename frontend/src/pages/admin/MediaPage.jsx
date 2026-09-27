import { useState } from 'react';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, SkeletonCards } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { mediaApi } from '../../services/endpoints';
import { formatDate, formatFileSize } from '../../utils/format';
import { imageSrc, resolveImageUrl } from '../../utils/image';

const PAGE_SIZE = 18;

const USAGE_LABELS = {
  product: 'Product',
  project: 'Project',
  service: 'Service',
  category: 'Category',
  company_settings: 'Company Settings',
  homepage: 'Homepage',
};

/**
 * Media library: upload images once, reuse them everywhere (products,
 * projects, homepage, logo). Shows where each image is used and protects
 * images that are still referenced from accidental deletion.
 */
export default function MediaPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [forceTarget, setForceTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [usageTarget, setUsageTarget] = useState(null);
  const [usages, setUsages] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Media Library | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      mediaApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        sort: '-createdAt',
      }),
    [page, debouncedSearch]
  );

  const items = data?.items || [];
  const meta = data?.meta || null;

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await mediaApi.upload(fileList);
      toast.success(uploaded.length === 1 ? 'Image uploaded.' : `${uploaded.length} images uploaded.`);
      setPage(1);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCopyUrl = async (media) => {
    const url = resolveImageUrl(media.url);
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Image URL copied to clipboard.');
    } catch {
      toast.info(`Image URL: ${url}`);
    }
  };

  const openUsage = async (media) => {
    setUsageTarget(media);
    setUsages(null);
    setUsageLoading(true);
    try {
      const result = await mediaApi.usage(media._id);
      setUsages(result || []);
    } catch (err) {
      toast.error(err?.message || 'Could not check where this image is used.');
      setUsageTarget(null);
    } finally {
      setUsageLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await mediaApi.remove(deleteTarget._id);
      toast.success('Image deleted.');
      setDeleteTarget(null);
      reload({ silent: true });
    } catch (err) {
      // Image still in use — offer a forced delete.
      if (err?.status === 409 || /in use/i.test(err?.message || '')) {
        setForceTarget(deleteTarget);
        setDeleteTarget(null);
      } else {
        toast.error(err?.message || 'Could not delete the image.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!forceTarget) return;
    setDeleting(true);
    try {
      await mediaApi.remove(forceTarget._id, true);
      toast.success('Image force-deleted.');
      setForceTarget(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the image.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load media" message={error.message} onRetry={() => reload()} />
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
              placeholder="Search by file name…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search media"
            />
          </div>
        </div>
        <label className={`btn btn--accent${uploading ? ' btn--block' : ''}`} style={{ cursor: 'pointer' }}>
          {uploading ? <span className="btn__spinner" aria-hidden="true" /> : <Icon name="upload" size={18} />}
          <span>{uploading ? 'Uploading…' : 'Upload Images'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={uploading}
            onChange={(event) => {
              handleUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
      </div>

      {loading ? (
        <SkeletonCards count={9} className="media-grid" />
      ) : items.length === 0 ? (
        <div className="panel">
          <EmptyState
            icon="image"
            title="No media found"
            message={
              debouncedSearch
                ? 'No images match your search.'
                : 'Upload images here and reuse them across products, projects and the homepage.'
            }
          />
        </div>
      ) : (
        <div className="media-grid">
          {items.map((media) => (
            <div className="media-card" key={media._id}>
              <div className="media-card__thumb">
                <img
                  src={imageSrc(media.url)}
                  alt={media.alt || media.originalName || ''}
                  loading="lazy"
                />
              </div>
              <div className="media-card__meta">
                <span className="media-card__name" title={media.originalName || media.filename}>
                  {media.originalName || media.filename}
                </span>
                <span>
                  {formatFileSize(media.size)} · {formatDate(media.createdAt)}
                </span>
              </div>
              <div className="media-card__actions">
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => handleCopyUrl(media)}
                  title="Copy image URL"
                  aria-label={`Copy URL for ${media.originalName || media.filename}`}
                >
                  <Icon name="external-link" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => openUsage(media)}
                  title="Where is this used?"
                  aria-label={`Check usage of ${media.originalName || media.filename}`}
                >
                  <Icon name="info" size={16} />
                </button>
                <button
                  type="button"
                  className="icon-btn icon-btn--danger"
                  onClick={() => setDeleteTarget(media)}
                  title="Delete image"
                  aria-label={`Delete ${media.originalName || media.filename}`}
                >
                  <Icon name="trash" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 ? (
        <div style={{ marginTop: 'var(--space-6)', display: 'flex', justifyContent: 'center' }}>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      ) : null}

      {/* -------- Usage modal -------- */}
      <Modal
        open={Boolean(usageTarget)}
        title="Where this image is used"
        subtitle={usageTarget?.originalName || usageTarget?.filename}
        onClose={() => setUsageTarget(null)}
        footer={
          <Button variant="ghost" onClick={() => setUsageTarget(null)}>
            Close
          </Button>
        }
      >
        {usageLoading ? (
          <div className="loading-block" style={{ minHeight: '20vh' }}>
            <span className="spinner" aria-hidden="true" />
            <span>Checking usage…</span>
          </div>
        ) : usages && usages.length > 0 ? (
          <div className="repeat-list">
            {usages.map((usage, index) => (
              <div
                key={`${usage.type}-${usage.name}-${index}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-line)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span className="badge badge--accent">{USAGE_LABELS[usage.type] || usage.type}</span>
                <span style={{ color: 'var(--color-ink)' }}>{usage.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--color-muted)' }}>
            This image is not used anywhere yet. It is safe to delete.
          </p>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete image"
        message={
          deleteTarget
            ? `"${deleteTarget.originalName || deleteTarget.filename}" will be removed from the media library.`
            : ''
        }
        confirmLabel="Delete image"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={Boolean(forceTarget)}
        title="Image is still in use"
        message={
          forceTarget
            ? `"${forceTarget.originalName || forceTarget.filename}" is still used on the website. Deleting it will leave broken images where it was used.`
            : ''
        }
        confirmLabel="Delete anyway"
        loading={deleting}
        onCancel={() => setForceTarget(null)}
        onConfirm={handleForceDelete}
      />
    </>
  );
}
