import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import ImagePicker from '../../components/admin/ImagePicker';
import PairListInput from '../../components/admin/PairListInput';
import StringListInput from '../../components/admin/StringListInput';
import SwitchField from '../../components/admin/SwitchField';
import ServiceIcon from '../../components/public/ServiceIcon';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { servicesApi } from '../../services/endpoints';
import { SERVICE_ICON_OPTIONS } from '../../utils/constants';

const EMPTY_FORM = {
  name: '',
  icon: 'window',
  shortDescription: '',
  description: '',
  image: null,
  features: [],
  process: [],
  featured: false,
  isActive: true,
  sortOrder: 0,
};

/**
 * Create / edit a service. Services represent the custom work the company
 * does for customers — windows, glass, aluminum, partitions, interiors —
 * and are shown on the public Services page with their own detail pages.
 */
export default function ServiceFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useDocumentMeta({ title: isEdit ? 'Edit Service | Admin' : 'New Service | Admin' });

  const { data: service, loading, error, reload } = useApi(
    () => (id ? servicesApi.getById(id) : Promise.resolve(null)),
    [id]
  );

  // Load the service into the form when editing.
  useEffect(() => {
    if (!service) return;
    setForm({
      name: service.name || '',
      icon: service.icon || 'window',
      shortDescription: service.shortDescription || '',
      description: service.description || '',
      image: service.image || null,
      features: service.features || [],
      process: service.process || [],
      featured: Boolean(service.featured),
      isActive: Boolean(service.isActive),
      sortOrder: service.sortOrder || 0,
    });
  }, [service]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (name.length < 2 || name.length > 120) {
      setFieldErrors({ name: 'Service name is required (2-120 characters).' });
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setFieldErrors({});

    const payload = {
      ...form,
      name,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      features: form.features.map((item) => item.trim()).filter(Boolean),
      process: form.process.filter((step) => step.title?.trim()),
      image: form.image?.url ? { url: form.image.url, alt: form.image.alt || '' } : null,
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await servicesApi.update(id, payload);
        toast.success('Service updated successfully.');
      } else {
        await servicesApi.create(payload);
        toast.success('Service created successfully.');
      }
      navigate('/admin/services');
    } catch (err) {
      toast.error(err?.message || 'Could not save the service.');
      setSaving(false);
    }
  };

  if (isEdit && loading) return <LoadingBlock label="Loading service…" minHeight="50vh" />;

  if (isEdit && (error || !service)) {
    return (
      <ErrorState
        title="Service not found"
        message={error?.message || 'This service does not exist.'}
        onRetry={() => reload()}
      />
    );
  }

  return (
    <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
      {/* -------- Basic information -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="tool" size={18} />
          Basic Information
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="service-name">
              Service name <span className="required">*</span>
            </label>
            <input
              id="service-name"
              className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
              type="text"
              maxLength={120}
              placeholder="e.g. Glass Partition Installation"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
            {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="service-icon">
              Icon
            </label>
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
              <span
                className="stat-card__icon"
                style={{ width: 44, height: 44 }}
                aria-hidden="true"
              >
                <ServiceIcon icon={form.icon} size={21} />
              </span>
              <select
                id="service-icon"
                className="form-select"
                value={form.icon}
                onChange={(event) => update('icon', event.target.value)}
              >
                {SERVICE_ICON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="service-sort">
              Sort order
            </label>
            <input
              id="service-sort"
              className="form-input"
              type="number"
              min={0}
              max={9999}
              value={form.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
            <span className="form-hint">Lower numbers appear first.</span>
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="service-short">
              Short description
            </label>
            <textarea
              id="service-short"
              className="form-textarea"
              rows={2}
              maxLength={300}
              placeholder="One or two sentences shown on service cards."
              value={form.shortDescription}
              onChange={(event) => update('shortDescription', event.target.value)}
            />
            <span className="form-hint">{form.shortDescription.length}/300 characters</span>
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="service-description">
              Full description
            </label>
            <textarea
              id="service-description"
              className="form-textarea"
              rows={6}
              placeholder="Explain the service, typical projects and what customers can expect."
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* -------- Image -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="image" size={18} />
          Image
        </h2>
        <ImagePicker
          label="Service image"
          value={form.image}
          onChange={(image) => update('image', image)}
          hint="Shown on the services page and the service detail header."
        />
      </div>

      {/* -------- Details -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="list" size={18} />
          Details
        </h2>
        <div className="form-grid">
          <StringListInput
            label="What's included"
            value={form.features}
            onChange={(features) => update('features', features)}
            placeholder="e.g. Free on-site measurement"
            addLabel="Add item"
          />
          <PairListInput
            label="Our process (how we work)"
            value={form.process}
            onChange={(process) => update('process', process)}
            fields={[
              { key: 'title', placeholder: 'Step title (e.g. Site Visit)', width: 1 },
              { key: 'description', placeholder: 'What happens in this step', width: 1.6 },
            ]}
            addLabel="Add step"
            hint="Steps are displayed in order on the service detail page."
          />
        </div>
      </div>

      {/* -------- Visibility -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="eye" size={18} />
          Visibility
        </h2>
        <div style={{ display: 'flex', gap: 'var(--space-10)', flexWrap: 'wrap' }}>
          <SwitchField
            label="Published on the website"
            checked={form.isActive}
            onChange={(value) => update('isActive', value)}
          />
          <SwitchField
            label="Featured on the homepage"
            checked={form.featured}
            onChange={(value) => update('featured', value)}
          />
        </div>
      </div>

      {/* -------- Actions -------- */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          marginTop: 'var(--space-8)',
        }}
      >
        <Button variant="ghost" onClick={() => navigate('/admin/services')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={saving} icon="check">
          {isEdit ? 'Save Changes' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}
