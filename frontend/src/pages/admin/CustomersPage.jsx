import { useEffect, useState } from 'react';

import ConfirmDialog from '../../components/admin/ConfirmDialog';
import StatusSelect from '../../components/admin/StatusSelect';
import StringListInput from '../../components/admin/StringListInput';
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
import { customersApi } from '../../services/endpoints';
import { CUSTOMER_STATUSES, INQUIRY_STATUSES, QUOTE_STATUSES } from '../../utils/constants';
import { formatDate, mailtoLink, telLink, timeAgo } from '../../utils/format';

const PAGE_SIZE = 10;

/**
 * Customers / leads: one unified contact list built automatically from
 * inquiries and quote requests. Shows each person's request history and
 * lets the owner manage status, interests and private notes.
 */
export default function CustomersPage() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [detailId, setDetailId] = useState(null);
  const [notes, setNotes] = useState('');
  const [interestedServices, setInterestedServices] = useState([]);
  const [savingDetail, setSavingDetail] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search);

  useDocumentMeta({ title: 'Customers | Admin' });

  const { data, loading, error, reload } = useApi(
    () =>
      customersApi.list({
        page,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status || undefined,
        sort: '-lastContactAt',
      }),
    [page, debouncedSearch, status]
  );

  const { data: detail, loading: detailLoading, reload: reloadDetail } = useApi(
    () => (detailId ? customersApi.getById(detailId) : Promise.resolve(null)),
    [detailId]
  );

  const items = data?.items || [];
  const meta = data?.meta || null;
  const customer = detail?.customer;
  const customerInquiries = detail?.inquiries || [];
  const customerQuotes = detail?.quotes || [];

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  // Sync editable fields whenever a customer's details load.
  useEffect(() => {
    if (!customer) return;
    setNotes(customer.notes || '');
    setInterestedServices(customer.interestedServices || []);
  }, [customer]);

  const closeDetail = () => setDetailId(null);

  const handleStatusChange = async (row, nextStatus) => {
    try {
      await customersApi.update(row._id, { status: nextStatus });
      toast.success(`Status changed to "${CUSTOMER_STATUSES[nextStatus]?.label || nextStatus}".`);
      reload({ silent: true });
      if (detailId === row._id) reloadDetail({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not update the customer.');
    }
  };

  const handleSaveDetail = async () => {
    if (!detailId) return;
    setSavingDetail(true);
    try {
      await customersApi.update(detailId, {
        notes,
        interestedServices: interestedServices.map((item) => item.trim()).filter(Boolean),
      });
      toast.success('Customer updated.');
      reload({ silent: true });
      reloadDetail({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not save the customer.');
    } finally {
      setSavingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await customersApi.remove(deleteTarget._id);
      toast.success(`"${deleteTarget.name}" was removed from the customer list.`);
      setDeleteTarget(null);
      if (detailId === deleteTarget._id) setDetailId(null);
      reload({ silent: true });
    } catch (err) {
      toast.error(err?.message || 'Could not delete the customer.');
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <ErrorState title="Could not load customers" message={error.message} onRetry={() => reload()} />
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
              placeholder="Search by name, phone, email or service…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              aria-label="Search customers"
            />
          </div>
          <select
            className="admin-select"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.entries(CUSTOMER_STATUSES).map(([key, meta_]) => (
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
                <th>Interested In</th>
                <th>Activity</th>
                <th>Last Contact</th>
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
                      icon="users"
                      title="No customers found"
                      message={
                        debouncedSearch || status
                          ? 'Try adjusting your search or filters.'
                          : 'Customers are added automatically when someone sends an inquiry or requests a quote.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row._id}>
                    <td>
                      <button type="button" style={{ textAlign: 'left' }} onClick={() => setDetailId(row._id)}>
                        <span className="admin-table__title">{row.name}</span>
                        <span className="admin-table__sub">{row.phone || row.email}</span>
                      </button>
                    </td>
                    <td>
                      {row.interestedServices?.length > 0 ? (
                        <div className="tag-row">
                          {row.interestedServices.slice(0, 2).map((service) => (
                            <span className="tag" key={service}>
                              {service}
                            </span>
                          ))}
                          {row.interestedServices.length > 2 ? (
                            <span className="tag">+{row.interestedServices.length - 2}</span>
                          ) : null}
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {row.inquiryCount} inquiries · {row.quoteCount} quotes
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {row.lastContactAt ? timeAgo(row.lastContactAt) : '—'}
                    </td>
                    <td>
                      <StatusSelect
                        map={CUSTOMER_STATUSES}
                        value={row.status}
                        onChange={(next) => handleStatusChange(row, next)}
                      />
                    </td>
                    <td>
                      <div className="admin-table__actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          type="button"
                          className="icon-btn"
                          onClick={() => setDetailId(row._id)}
                          title="View profile"
                          aria-label={`View ${row.name}`}
                        >
                          <Icon name="eye" size={17} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn icon-btn--danger"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete customer"
                          aria-label={`Delete ${row.name}`}
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

      {/* -------- Customer profile modal -------- */}
      <Modal
        open={Boolean(detailId)}
        wide
        title={customer ? customer.name : 'Customer'}
        subtitle={customer ? `Added ${formatDate(customer.createdAt)}` : ''}
        onClose={closeDetail}
        footer={
          <>
            <Button variant="ghost" onClick={closeDetail}>
              Close
            </Button>
            <Button
              variant="accent"
              onClick={handleSaveDetail}
              loading={savingDetail}
              disabled={detailLoading || !customer}
              icon="check"
            >
              Save Changes
            </Button>
          </>
        }
      >
        {detailLoading || !customer ? (
          <div className="loading-block" style={{ minHeight: '30vh' }}>
            <span className="spinner" aria-hidden="true" />
            <span>Loading profile…</span>
          </div>
        ) : (
          <div className="detail-list">
            <div className="detail-list__row">
              <span className="detail-list__label">Status</span>
              <span className="detail-list__value">
                <StatusSelect
                  map={CUSTOMER_STATUSES}
                  value={customer.status}
                  onChange={(next) => handleStatusChange(customer, next)}
                />
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Phone</span>
              <span className="detail-list__value">
                {customer.phone ? <a href={telLink(customer.phone)}>{customer.phone}</a> : '—'}
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Email</span>
              <span className="detail-list__value">
                {customer.email ? <a href={mailtoLink(customer.email)}>{customer.email}</a> : '—'}
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Interested in</span>
              <span className="detail-list__value">
                <StringListInput
                  label=""
                  value={interestedServices}
                  onChange={setInterestedServices}
                  placeholder="e.g. Aluminum windows"
                  addLabel="Add interest"
                />
              </span>
            </div>
            <div className="detail-list__row">
              <span className="detail-list__label">Private notes</span>
              <span className="detail-list__value">
                <textarea
                  className="form-textarea"
                  rows={3}
                  maxLength={4000}
                  placeholder="Preferences, meeting notes, site details…"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </span>
            </div>

            {/* Inquiries history */}
            <div className="detail-list__row">
              <span className="detail-list__label">Inquiries</span>
              <span className="detail-list__value">
                {customerInquiries.length === 0 ? (
                  <span className="form-hint">No inquiries yet.</span>
                ) : (
                  <div className="repeat-list">
                    {customerInquiries.map((inquiry) => (
                      <div
                        key={inquiry._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          border: '1px solid var(--color-line)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span>
                          <span className="admin-table__title">
                            {inquiry.subject || inquiry.service || 'General inquiry'}
                          </span>
                          <span className="admin-table__sub">{formatDate(inquiry.createdAt)}</span>
                        </span>
                        <StatusBadge map={INQUIRY_STATUSES} value={inquiry.status} />
                      </div>
                    ))}
                  </div>
                )}
              </span>
            </div>

            {/* Quotes history */}
            <div className="detail-list__row">
              <span className="detail-list__label">Quote Requests</span>
              <span className="detail-list__value">
                {customerQuotes.length === 0 ? (
                  <span className="form-hint">No quote requests yet.</span>
                ) : (
                  <div className="repeat-list">
                    {customerQuotes.map((quote) => (
                      <div
                        key={quote._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--space-3)',
                          padding: 'var(--space-3)',
                          border: '1px solid var(--color-line)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <span>
                          <span className="admin-table__title">
                            {quote.productService || 'Custom requirement'}
                          </span>
                          <span className="admin-table__sub">{formatDate(quote.createdAt)}</span>
                        </span>
                        <StatusBadge map={QUOTE_STATUSES} value={quote.status} />
                      </div>
                    ))}
                  </div>
                )}
              </span>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed from the customer list. Their inquiries and quotes are kept for records.`
            : ''
        }
        confirmLabel="Delete customer"
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}
