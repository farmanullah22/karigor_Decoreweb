import { useEffect, useState } from 'react';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusSelect from '../../components/admin/StatusSelect';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import StatusBadge from '../../components/common/StatusBadge';
import { EmptyState, ErrorState, SkeletonRows } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDebounce } from '../../hooks/useDebounce';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { inquiriesApi } from '../../services/endpoints';
import { INQUIRY_STATUSES } from '../../utils/constants';
import { formatDateTime, mailtoLink, telLink, timeAgo } from '../../utils/format';

const PAGE_SIZE = 10;

const SOURCE_LABELS = {
  contact_form: 'Contact Form',
  product: 'Product Page',
  service: 'Service Page',
  footer: 'Footer',
};

/**
 * Inquiries inbox: every contact form message in one place with status
 * workflow (new → contacted → in progress → completed/closed) and
 * private admin notes. Status changes save instantly.
 */
export default function InquiriesPage() {
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

  useDocumentMeta({ title: 'Inquiries | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      inquiriesApi.list({
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

  const openDetail = (inquiry) => {
    setSelected(inquiry);
    setNotes(inquiry.adminNotes || '');
  };

  const handleStatusChange = async (inquiry, nextStatus) => {
    try {
      await inquiriesApi.updateStatus(inquiry._id, nextStatus);
      toast.success(`Status changed to "${INQUIRY_STATUSES[nextStatus]?.label || nextStatus}".`);
      setSelected((current) =>
        current && current._id === inquiry._id ? { ...current, status: nextStatus } : current
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
      await inquiriesApi.updateNotes(selected._id, notes);
      toast.success('Notes saved.');
      setSelected((current) =>
        current ? { ...current, adminNotes: notes } : current
      );
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
      await inquiriesApi.remove(deleteTarget._id);
      toast.success('Inquiry deleted.');
      setDeleteTarget(null);
      if (selected && selected._id === deleteTarget._id) setSelected(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the inquiry.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load inquiries" message={error.message} onRetry={() => reload()} />
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
              placeholder="Search by name, phone, email or message…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search inquiries"
            />
          </div>
          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.entries(INQUIRY_STATUSES).map(([key, meta_]) => (
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
                <th>Subject</th>
                <th>Source</th>
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
                      icon="inbox"
                      title="No inquiries found"
                      message={
                        debouncedSearch || status
                          ? 'Try adjusting your search or filters.'
                          : 'Messages from the contact form will appear here.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((inquiry) => (
                  <tr key={inquiry._id}>
                    <td>
                      <button
                        type="button"
                        style={{ textAlign: 'left' }}
                        onClick={() => openDetail(inquiry)}
                      >
                        <span className="admin-table__title">{inquiry.name}</span>
                        <span className="admin-table__sub">{inquiry.phone}</span>
                      </button>
                    </td>
                    <td>{inquiry.subject || inquiry.service || 'General inquiry'}</td>
                    <td>
                      <span className="badge badge--neutral">
                        {SOURCE_LABELS[inquiry.source] || inquiry.source}
                      </span>
                    </td>
                    <td>
                      <StatusSelect
                        map={INQUIRY_STATUSES}
                        value={inquiry.status}
                        onChange={(next) => handleStatusChange(inquiry, next)}
                      />
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }} title={formatDateTime(inquiry.createdAt)}>
                      {timeAgo(inquiry.createdAt)}
                    </td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => openDetail(inquiry)}
                          title="View details"
                          aria-label={`View inquiry from ${inquiry.name}`}
                        >
                          <Icon name="eye" size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(inquiry)}
                          title="Delete inquiry"
                          aria-label={`Delete inquiry from ${inquiry.name}`}
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
        title={selected ? `Inquiry from ${selected.name}` : 'Inquiry'}
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
                  map={INQUIRY_STATUSES}
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
            {selected.subject ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Subject</span>
                <span className="detail-list__value">{selected.subject}</span>
              </div>
            ) : null}
            {selected.service ? (
              <div className="detail-list__row">
                <span className="detail-list__label">Service</span>
                <span className="detail-list__value">{selected.service}</span>
              </div>
            ) : null}
            <div className="detail-list__row">
              <span className="detail-list__label">Source</span>
              <span className="detail-list__value">
                {SOURCE_LABELS[selected.source] || selected.source}
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Message</span>
              <span className="detail-list__value">
                <div className="message-box">{selected.message}</div>
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Admin notes</span>
              <span className="detail-list__value">
                <textarea
                  className="form-textarea"
                  rows={3}
                  maxLength={4000}
                  placeholder="Private notes — only visible in the dashboard."
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
        title="Delete inquiry"
        message={
          deleteTarget
            ? `The inquiry from "${deleteTarget.name}" will be permanently removed.`
            : ''
        }
        confirmLabel="Delete inquiry"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
