import { useEffect, useState } from 'react';

import ImagePicker from '../../components/admin/ImagePicker';
import PairListInput from '../../components/admin/PairListInput';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { settingsApi } from '../../services/endpoints';

/**
 * Company settings: identity, contact details, business hours, social
 * links and default SEO. The public website reads every value from here —
 * nothing on the site is hard-coded.
 */
export default function SettingsPage() {
  const toast = useToast();
  const { setSettings } = useSettings();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useDocumentMeta({ title: 'Company Settings | Admin' });

  const { data: settings, loading, error, reload } = useApi(() => settingsApi.getForAdmin(), []);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const updateSocial = (key, value) =>
    setForm((current) => ({ ...current, social: { ...current.social, [key]: value } }));

  const updateMeta = (key, value) =>
    setForm((current) => ({ ...current, defaultMeta: { ...current.defaultMeta, [key]: value } }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !form) return;

    const payload = {
      companyName: form.companyName.trim(),
      tagline: form.tagline.trim(),
      footerDescription: form.footerDescription.trim(),
      logo: form.logo || '',
      favicon: form.favicon || '',
      phone: form.phone.trim(),
      whatsapp: form.whatsapp.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      googleMapsUrl: form.googleMapsUrl.trim(),
      businessHours: (form.businessHours || []).filter((row) => row.days?.trim() && row.hours?.trim()),
      social: form.social,
      defaultMeta: form.defaultMeta,
    };

    setSaving(true);
    try {
      const saved = await settingsApi.update(payload);
      toast.success('Company settings saved successfully.');
      if (saved) {
        setForm(saved);
        setSettings(saved);
      }
    } catch (err) {
      toast.error(err?.message || 'Could not save the settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!form && !error)) {
    return <LoadingBlock label="Loading settings…" minHeight="50vh" />;
  }

  if (error || !form) {
    return (
      <ErrorState
        title="Could not load settings"
        message={error?.message || 'Please try again.'}
        onRetry={() => reload()}
      />
    );
  }

  return (
    <form className="admin-form-card" onSubmit={handleSubmit}>
      {/* -------- Identity & branding -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="award" size={18} />
          Identity & Branding
        </h2>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="settings-company">
              Company name <span className="required">*</span>
            </label>
            <input
              id="settings-company"
              className="form-input"
              type="text"
              value={form.companyName}
              onChange={(event) => update('companyName', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="settings-tagline">
              Tagline
            </label>
            <input
              id="settings-tagline"
              className="form-input"
              type="text"
              maxLength={200}
              placeholder="e.g. Windows, Glass, Aluminum & Interior Solutions"
              value={form.tagline}
              onChange={(event) => update('tagline', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="settings-footer">
              Footer description
            </label>
            <textarea
              id="settings-footer"
              className="form-textarea"
              rows={2}
              maxLength={500}
              placeholder="A short paragraph shown in the website footer."
              value={form.footerDescription}
              onChange={(event) => update('footerDescription', event.target.value)}
            />
          </div>

          <ImagePicker
            label="Logo (optional)"
            value={form.logo ? { url: form.logo, alt: '' } : null}
            onChange={(image) => update('logo', image?.url || '')}
            hint="Transparent PNG or SVG works best in the header."
          />
          <ImagePicker
            label="Favicon (optional)"
            value={form.favicon ? { url: form.favicon, alt: '' } : null}
            onChange={(image) => update('favicon', image?.url || '')}
            hint="Small square icon shown in the browser tab."
          />
        </div>
      </div>

      {/* -------- Contact details -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="phone" size={18} />
          Contact Details
        </h2>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label" htmlFor="settings-phone">
              Phone number
            </label>
            <input
              id="settings-phone"
              className="form-input"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              value={form.phone}
              onChange={(event) => update('phone', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="settings-whatsapp">
              WhatsApp number
            </label>
            <input
              id="settings-whatsapp"
              className="form-input"
              type="tel"
              placeholder="+880 1XXX-XXXXXX"
              value={form.whatsapp}
              onChange={(event) => update('whatsapp', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="settings-email">
              Email address
            </label>
            <input
              id="settings-email"
              className="form-input"
              type="email"
              placeholder="info@example.com"
              value={form.email}
              onChange={(event) => update('email', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label" htmlFor="settings-maps">
              Google Maps URL
            </label>
            <input
              id="settings-maps"
              className="form-input"
              type="url"
              placeholder="Paste a Google Maps link or embed URL"
              value={form.googleMapsUrl}
              onChange={(event) => update('googleMapsUrl', event.target.value)}
            />
            <span className="form-hint">Used for the map on the contact page.</span>
          </div>
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="settings-address">
              Workshop / office address
            </label>
            <textarea
              id="settings-address"
              className="form-textarea"
              rows={2}
              maxLength={400}
              placeholder="Street, area, city"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
            />
          </div>

          <PairListInput
            label="Business hours"
            value={form.businessHours || []}
            onChange={(rows) => update('businessHours', rows)}
            fields={[
              { key: 'days', placeholder: 'Days (e.g. Saturday – Thursday)', width: 1 },
              { key: 'hours', placeholder: 'Hours (e.g. 9:00 AM – 8:00 PM)', width: 1.2 },
            ]}
            addLabel="Add hours row"
            hint="Shown on the contact page and in the website footer."
          />
        </div>
      </div>

      {/* -------- Social links -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="heart" size={18} />
          Social Media
        </h2>
        <div className="form-grid">
          {[
            { key: 'facebook', label: 'Facebook', icon: 'facebook' },
            { key: 'instagram', label: 'Instagram', icon: 'instagram' },
            { key: 'tiktok', label: 'TikTok', icon: 'tiktok' },
            { key: 'youtube', label: 'YouTube', icon: 'youtube' },
            { key: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
          ].map((network) => (
            <div className="form-field" key={network.key}>
              <label className="form-label" htmlFor={`settings-social-${network.key}`}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <Icon name={network.icon} size={15} />
                  {network.label}
                </span>
              </label>
              <input
                id={`settings-social-${network.key}`}
                className="form-input"
                type="url"
                placeholder="https://…"
                value={form.social?.[network.key] || ''}
                onChange={(event) => updateSocial(network.key, event.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* -------- SEO -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="search" size={18} />
          Default SEO
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="settings-meta-title">
              Default meta title
            </label>
            <input
              id="settings-meta-title"
              className="form-input"
              type="text"
              placeholder="Used when a page does not define its own title."
              value={form.defaultMeta?.title || ''}
              onChange={(event) => updateMeta('title', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="settings-meta-description">
              Default meta description
            </label>
            <textarea
              id="settings-meta-description"
              className="form-textarea"
              rows={2}
              maxLength={300}
              placeholder="A short summary for search engines."
              value={form.defaultMeta?.description || ''}
              onChange={(event) => updateMeta('description', event.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end',
          marginTop: 'var(--space-8)',
        }}
      >
        <Button type="button" variant="ghost" onClick={() => reload()} disabled={saving}>
          Reset Changes
        </Button>
        <Button type="submit" variant="accent" loading={saving} icon="check">
          Save Settings
        </Button>
      </div>
    </form>
  );
}
