import { useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import { SkeletonCards } from '../common/States';
import { useApi } from '../../hooks/useApi';
import { useToast } from '../../context/ToastContext';
import { mediaApi } from '../../services/endpoints';
import { imageSrc } from '../../utils/image';

const LIMIT = 24;

/**
 * Modal that lets admins pick one or more images from the media library,
 * or upload new ones on the spot. Calls onSelect with an array of
 * `{ url, alt, name }` objects.
 */
export default function MediaPickerModal({ open, onClose, onSelect, multiple = false }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [uploading, setUploading] = useState(false);

  const { data, loading, reload } = useApi(
    () => mediaApi.list({ page, limit: LIMIT, sort: '-createdAt' }),
    [page, open],
    { immediate: open }
  );

  const items = data?.items || [];
  const meta = data?.meta || null;

  const toggle = (media) => {
    const entry = { url: media.url, alt: media.alt || '', name: media.originalName || media.filename || '' };
    setSelected((current) => {
      const exists = current.some((item) => item.url === entry.url);
      if (exists) return current.filter((item) => item.url !== entry.url);
      if (!multiple) return [entry];
      return [...current, entry];
    });
  };

  const handleUpload = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    try {
      const uploaded = await mediaApi.upload(fileList);
      toast.success(
        uploaded.length === 1 ? 'Image uploaded.' : `${uploaded.length} images uploaded.`
      );
      const picked = uploaded.slice(0, multiple ? undefined : 1).map((media) => ({
        url: media.url,
        alt: media.alt || '',
        name: media.originalName || media.filename || '',
      }));
      setSelected((current) => (multiple ? [...current, ...picked] : picked));
      reload({ silent: true });
    } catch (error) {
      toast.error(error.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const confirm = () => {
    if (selected.length === 0) return;
    onSelect(selected);
    setSelected([]);
    onClose?.();
  };

  const close = () => {
    setSelected([]);
    onClose?.();
  };

  return (
    <Modal
      open={open}
      wide
      title={multiple ? 'Select images' : 'Select an image'}
      subtitle="Choose from your media library or upload new files."
      onClose={close}
      footer={
        <>
          <span style={{ marginRight: 'auto', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            {selected.length > 0 ? `${selected.length} selected` : 'Nothing selected yet'}
          </span>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="accent" onClick={confirm} disabled={selected.length === 0}>
            {multiple ? 'Add selected' : 'Use image'}
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', gap: 10, marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
        <label className="btn btn--secondary btn--sm" style={{ cursor: 'pointer' }}>
          <Icon name="upload" size={16} />
          <span>{uploading ? 'Uploading…' : 'Upload new'}</span>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(event) => {
              handleUpload(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
        <Button size="sm" variant="ghost" icon="refresh" onClick={() => reload()} disabled={loading}>
          Refresh
        </Button>
      </div>

      {loading ? (
        <SkeletonCards count={6} className="media-modal-grid" />
      ) : items.length === 0 ? (
        <div className="panel-empty">
          <p>No media yet. Upload your first image above.</p>
        </div>
      ) : (
        <div className="media-modal-grid">
          {items.map((media) => {
            const isSelected = selected.some((item) => item.url === media.url);
            return (
              <button
                type="button"
                key={media._id}
                className={`media-card${isSelected ? ' media-card--selected' : ''}`}
                onClick={() => toggle(media)}
                style={{ textAlign: 'left', padding: 0 }}
                aria-pressed={isSelected}
              >
                <div className="media-card__thumb">
                  <img src={imageSrc(media.url)} alt={media.alt || media.originalName || ''} loading="lazy" />
                </div>
                <div className="media-card__meta">
                  <span className="media-card__name">{media.originalName || media.filename}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'center' }}>
          <Pagination meta={meta} onPageChange={setPage} disabled={loading} />
        </div>
      )}
    </Modal>
  );
}
