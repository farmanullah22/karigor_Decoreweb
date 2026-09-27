import { useEffect, useState } from 'react';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusSelect from '../../components/admin/StatusSelect';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { quotesApi } from '../../services/endpoints';
import { QUOTE_STATUSES } from '../../utils/constants';
import { formatDateTime, mailtoLink, projectTypeLabel, telLink, timeAgo } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const PAGE_SIZE = 10;

const SOURCE_LABELS = {
  quote_page: 'Quote Page',
  product: 'Product Page',
  service: 'Service Page',
  homepage: 'Homepage',
};

/**
 * Quote requests pipeline: review requirements, track status from new to
 * approved, attach private notes and inspect customer-uploaded photos.
 */
export default function QuotesPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Quote Requests | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      quotesApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sort: '-createdAt',
      }),
    [page, debouncedSearch, status]
  );

  const items = data?.items || [];
  const meta = data?.meta || null;

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const openDetail = (quote) => {
    setSelected(quote);
    setNotes(quote.adminNotes || '');
  };

  const handleStatusChange = async (quote, nextStatus) => {
    try {
      await quotesApi.updateStatus(quote._id, nextStatus);
      toast.success(`Status changed to "${QUOTE_STATUSES[nextStatus]?.label || nextStatus}".`);
      setSelected((current) =>
        current && current._id === quote._id ? { ...current, status: nextStatus } : current
      );
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the status.');
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSavingNotes(true);
    try {
      await quotesApi.updateNotes(selected._id, notes);
      toast.success('Notes saved.');
      setSelected((current) => (current ? { ...current, adminNotes: notes } : current));
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not save the notes.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await quotesApi.remove(deleteTarget._id);
      toast.success('Quote request deleted.');
      setDeleteTarget(null);
      if (selected && selected._id === deleteTarget._id) setSelected(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the quote request.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Could not load quote requests"
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
              placeholder="Search by name, phone, product or message…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search quote requests"
            />
          </div>
          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.entries(QUOTE_STATUSES).map(([key, meta_]) => (
              <option key={key} value={key}>
                {meta_.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="panel">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Requested For</th>
                <th>Type</th>
                <th>Status</th>
                <th>Received</th>
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
                      icon="file-text"
                      title="No quote requests found"
                      message={
                        debouncedSearch || status
                          ? 'Try adjusting your search or filters.'
                          : 'Requests from the quote form will appear here.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((quote) => (
                  <tr key={quote._id}>
                    <td>
                      <button
                        type="button"
                        style={{ textAlign: 'left' }}
                        onClick={() => openDetail(quote)}
                      >
                        <span className="admin-table__title">{quote.name}</span>
                        <span className="admin-table__sub">{quote.phone}</span>
                      </button>
                    </td>
                    <td>{quote.productService || 'Custom requirement'}</td>
                    <td>{projectTypeLabel(quote.projectType)}</td>
                    <td>
                      <StatusSelect
                        map={QUOTE_STATUSES}
                        value={quote.status}
                        onChange={(next) => handleStatusChange(quote, next)}
                      />
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }} title={formatDateTime(quote.createdAt)}>
                      {timeAgo(quote.createdAt)}
                    </td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openDetail(quote)}
                          title="View details"
                          aria-label={`View quote request from ${quote.name}`}
                        >
                          <Icon name="eye" size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(quote)}
                          title="Delete quote request"
                          aria-label={`Delete quote request from ${quote.name}`}
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

      {/* -------- Detail modal -------- */}
      <Modal
        open={Boolean(selected)}
        wide
        title={selected ? `Quote request from ${selected.name}` : 'Quote request'}
        subtitle={selected ? formatDateTime(selected.createdAt) : ''}
        onClose={() => setSelected(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button variant="accent" onClick={handleSaveNotes} loading={savingNotes} icon="check">
              Save Notes
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="detail-list">
            <div className="detail-list__row">
              <span className="detail-list__label">Status</span>
              <span className="detail-list__value">
                <StatusSelect
                  map={QUOTE_STATUSES}
                  value={selected.status}
                  onChange={(next) => handleStatusChange(selected, next)}
                />
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Phone</span>
              <span className="detail-list__value">
                <a href={telLink(selected.phone)}>{selected.phone}</a>
              </span>
            </div>
            {selected.email ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Email</span>
                <span className="detail-list__value">
                  <a href={mailtoLink(selected.email)}>{selected.email}</a>
                </span>
              </div>
            ) : null}
            {selected.productService ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Requested for</span>
                <span className="detail-list__value">{selected.productService}</span>
              </div>
            ) : null}
            {selected.quantity ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Quantity</span>
                <span className="detail-list__value">{selected.quantity}</span>
              </div>
            ) : null}
            {selected.projectType ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Project type</span>
                <span className="detail-list__value">{projectTypeLabel(selected.projectType)}</span>
              </div>
            ) : null}
            {selected.budget ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Budget</span>
                <span className="detail-list__value">{selected.budget}</span>
              </div>
            ) : null}
            <div className="detail-list__row">
              <span className="detail-list__label">Source</span>
              <span className="detail-list__value">
                {SOURCE_LABELS[selected.source] || selected.source}
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Requirements</span>
              <span className="detail-list__value">
                <div className="message-box">{selected.message}</div>
              </span>
            </div>
            {selected.attachments?.length > 0 ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Attachments</span>
                <span className="detail-list__value">
                  <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    {selected.attachments.map((file) => (
                      <a
                        key={file.url}
                        href={resolveImageUrl(file.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gallery-picker__item"
                        style={{ width: 96, height: 96, display: 'block' }}
                        title={file.name || 'Attachment'}
                      >
                        <img src={resolveImageUrl(file.url)} alt={file.name || 'Attachment'} loading="lazy" />
                      </a>
                    ))}
                  </div>
                </span>
              </div>
            ) : null}
            <div className="detail-list__row">
              <span className="detail-list__label">Admin notes</span>
              <span className="detail-list__value">
                <textarea
                  className="form-textarea"
                  rows={3}
                  maxLength={4000}
                  placeholder="Quotation details, follow-up dates, pricing decisions…"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </span>
            </div>
          </div>
        ) : null}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete quote request"
        message={
          deleteTarget
            ? `The quote request from "${deleteTarget.name}" will be permanently removed.`
            : ''
        }
        confirmLabel="Delete request"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
