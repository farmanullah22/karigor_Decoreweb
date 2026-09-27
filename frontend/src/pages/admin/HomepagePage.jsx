import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import ImagePicker from '../../components/admin/ImagePicker';
import PairListInput from '../../components/admin/PairListInput';
import SwitchField from '../../components/admin/SwitchField';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { homepageApi } from '../../services/endpoints';

const BUTTON_VARIANTS = [
  { value: 'primary', label: 'Primary (solid)' },
  { value: 'secondary', label: 'Secondary (accent)' },
  { value: 'ghost', label: 'Ghost (transparent)' },
];

/** Reusable heading + subheading + enabled switch block for a section. */
function SectionFields({ title, section, onField, onToggle, children }) {
  return (
    <div className="admin-form-section">
      <h2 className="admin-form-section__title">
        <Icon name="layers" size={18} />
        {title}
      </h2>
      <div className="form-grid">
        <div className="form-field">
          <label className="form-label">Heading</label>
          <input
            className="form-input"
            type="text"
            value={section.heading || ''}
            onChange={(event) => onField('heading', event.target.value)}
          />
        </div>
        <div className="form-field">
          <label className="form-label">Subheading</label>
          <input
            className="form-input"
            type="text"
            value={section.subheading || ''}
            onChange={(event) => onField('subheading', event.target.value)}
          />
        </div>
        <div className="form-field form-field--full">
          <SwitchField
            label="Show this section on the homepage"
            checked={section.enabled}
            onChange={onToggle}
          />
        </div>
        {children}
      </div>
    </div>
  );
}

/**
 * Homepage content editor: hero, about teaser, section headings and
 * toggles, why-us items, stats, closing CTA and SEO. Featured products,
 * services and projects are chosen via the "featured" flag on each item.
 */
export default function HomepagePage() {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useDocumentMeta({ title: 'Homepage | Admin' });

  const { data: homepage, loading, error, reload } = useApi(() => homepageApi.getForAdmin(), []);

  useEffect(() => {
    if (homepage) setForm(homepage);
  }, [homepage]);

  const updateHero = (key, value) =>
    setForm((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));

  const updateAbout = (key, value) =>
    setForm((current) => ({ ...current, about: { ...current.about, [key]: value } }));

  const updateSection = (section, key, value) =>
    setForm((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [section]: { ...current.sections[section], [key]: value },
      },
    }));

  const updateCta = (key, value) =>
    setForm((current) => ({ ...current, cta: { ...current.cta, [key]: value } }));

  const updateSeo = (key, value) =>
    setForm((current) => ({ ...current, seo: { ...current.seo, [key]: value } }));

  // --- Hero buttons ---
  const updateHeroButton = (index, key, value) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        buttons: current.hero.buttons.map((button, i) =>
          i === index ? { ...button, [key]: value } : button
        ),
      },
    }));

  const addHeroButton = () =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        buttons: [...(current.hero.buttons || []), { label: '', link: '', variant: 'primary' }],
      },
    }));

  const removeHeroButton = (index) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        buttons: current.hero.buttons.filter((_, i) => i !== index),
      },
    }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !form) return;

    const payload = {
      hero: {
        ...form.hero,
        buttons: (form.hero.buttons || []).filter(
          (button) => button.label?.trim() && button.link?.trim()
        ),
        backgroundImage: form.hero.backgroundImage?.url ? form.hero.backgroundImage : null,
      },
      about: {
        ...form.about,
        image: form.about.image?.url ? form.about.image : null,
      },
      sections: form.sections,
      cta: form.cta,
      seo: form.seo,
    };

    setSaving(true);
    try {
      await homepageApi.update(payload);
      toast.success('Homepage content saved successfully.');
    } catch (err) {
      toast.error(err?.message || 'Could not save the homepage content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!form && !error)) {
    return <LoadingBlock label="Loading homepage content…" minHeight="50vh" />;
  }

  if (error || !form) {
    return (
      <ErrorState
        title="Could not load homepage content"
        message={error?.message || 'Please try again.'}
        onRetry={() => reload()}
      />
    );
  }

  return (
    <form className="admin-form-card" onSubmit={handleSubmit}>
      {/* -------- Hero -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="sparkle" size={18} />
          Hero Section
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label">Heading</label>
            <input
              className="form-input"
              type="text"
              maxLength={200}
              placeholder="The big line visitors read first."
              value={form.hero.heading || ''}
              onChange={(event) => updateHero('heading', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">Subheading</label>
            <input
              className="form-input"
              type="text"
              maxLength={300}
              placeholder="Short supporting line."
              value={form.hero.subheading || ''}
              onChange={(event) => updateHero('subheading', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={3}
              maxLength={800}
              placeholder="A sentence or two about what you do."
              value={form.hero.description || ''}
              onChange={(event) => updateHero('description', event.target.value)}
            />
          </div>

          <ImagePicker
            label="Background image"
            value={form.hero.backgroundImage}
            onChange={(image) => updateHero('backgroundImage', image)}
            hint="A wide, high-quality photo works best. Text stays readable over a dark overlay."
          />

          <div className="form-field form-field--full">
            <span className="form-label">Hero buttons</span>
            {(form.hero.buttons || []).length > 0 ? (
              <div className="repeat-list">
                {(form.hero.buttons || []).map((button, index) => (
                  <div className="repeat-row" key={index}>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Label (e.g. Request a Quote)"
                      value={button.label || ''}
                      onChange={(event) => updateHeroButton(index, 'label', event.target.value)}
                    />
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Link (e.g. /quote)"
                      value={button.link || ''}
                      onChange={(event) => updateHeroButton(index, 'link', event.target.value)}
                    />
                    <select
                      className="form-select"
                      style={{ maxWidth: 190 }}
                      value={button.variant || 'primary'}
                      onChange={(event) => updateHeroButton(index, 'variant', event.target.value)}
                    >
                      {BUTTON_VARIANTS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger"
                      onClick={() => removeHeroButton(index)}
                      aria-label="Remove button"
                    >
                      <Icon name="trash" size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <span className="form-hint">No buttons yet.</span>
            )}
            <div style={{ marginTop: 'var(--space-3)' }}>
              <Button type="button" size="sm" variant="ghost" icon="plus" onClick={addHeroButton}>
                Add button
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* -------- About teaser -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="info" size={18} />
          About Teaser
        </h2>
        <div className="form-grid">
          <div className="form-field">
            <label className="form-label">Heading</label>
            <input
              className="form-input"
              type="text"
              maxLength={200}
              value={form.about.heading || ''}
              onChange={(event) => updateAbout('heading', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">CTA label</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. Learn More About Us"
              value={form.about.ctaLabel || ''}
              onChange={(event) => updateAbout('ctaLabel', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={4}
              maxLength={2000}
              value={form.about.description || ''}
              onChange={(event) => updateAbout('description', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">CTA link</label>
            <input
              className="form-input"
              type="text"
              placeholder="e.g. /about"
              value={form.about.ctaLink || ''}
              onChange={(event) => updateAbout('ctaLink', event.target.value)}
            />
          </div>
          <ImagePicker
            label="About image"
            value={form.about.image}
            onChange={(image) => updateAbout('image', image)}
          />
        </div>
      </div>

      {/* -------- Section headings & toggles -------- */}
      <SectionFields
        title="Products Section"
        section={form.sections.products}
        onField={(key, value) => updateSection('products', key, value)}
        onToggle={(value) => updateSection('products', 'enabled', value)}
      />
      <SectionFields
        title="Services Section"
        section={form.sections.services}
        onField={(key, value) => updateSection('services', key, value)}
        onToggle={(value) => updateSection('services', 'enabled', value)}
      />
      <SectionFields
        title="Projects Section"
        section={form.sections.projects}
        onField={(key, value) => updateSection('projects', key, value)}
        onToggle={(value) => updateSection('projects', 'enabled', value)}
      />

      {/* -------- Why us -------- */}
      <SectionFields
        title="Why Choose Us"
        section={form.sections.whyUs}
        onField={(key, value) => updateSection('whyUs', key, value)}
        onToggle={(value) => updateSection('whyUs', 'enabled', value)}
      >
        <PairListInput
          label="Reasons"
          value={form.sections.whyUs.items || []}
          onChange={(items) => updateSection('whyUs', 'items', items)}
          fields={[
            { key: 'title', placeholder: 'Title (e.g. Premium Materials)', width: 1 },
            { key: 'description', placeholder: 'One-sentence explanation', width: 1.6 },
          ]}
          addLabel="Add reason"
        />
      </SectionFields>

      {/* -------- Stats -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="award" size={18} />
          Stats Band
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <SwitchField
              label="Show the stats band on the homepage"
              checked={form.sections.stats.enabled}
              onChange={(value) => updateSection('stats', 'enabled', value)}
            />
          </div>
          <PairListInput
            label="Stats"
            value={form.sections.stats.items || []}
            onChange={(items) => updateSection('stats', 'items', items)}
            fields={[
              { key: 'value', placeholder: 'Value (e.g. 12)', width: 0.6 },
              { key: 'suffix', placeholder: 'Suffix (e.g. +)', width: 0.5 },
              { key: 'label', placeholder: 'Label (e.g. Years of Experience)', width: 1.6 },
            ]}
            addLabel="Add stat"
          />
        </div>
      </div>

      {/* -------- CTA -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="send" size={18} />
          Closing CTA
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label">Heading</label>
            <input
              className="form-input"
              type="text"
              maxLength={200}
              value={form.cta.heading || ''}
              onChange={(event) => updateCta('heading', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              rows={2}
              maxLength={500}
              value={form.cta.description || ''}
              onChange={(event) => updateCta('description', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Primary button label</label>
            <input
              className="form-input"
              type="text"
              value={form.cta.primaryLabel || ''}
              onChange={(event) => updateCta('primaryLabel', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Primary button link</label>
            <input
              className="form-input"
              type="text"
              value={form.cta.primaryLink || ''}
              onChange={(event) => updateCta('primaryLink', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Secondary button label</label>
            <input
              className="form-input"
              type="text"
              value={form.cta.secondaryLabel || ''}
              onChange={(event) => updateCta('secondaryLabel', event.target.value)}
            />
          </div>
          <div className="form-field">
            <label className="form-label">Secondary button link</label>
            <input
              className="form-input"
              type="text"
              value={form.cta.secondaryLink || ''}
              onChange={(event) => updateCta('secondaryLink', event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* -------- SEO -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="search" size={18} />
          SEO
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label">Meta title</label>
            <input
              className="form-input"
              type="text"
              placeholder="Shown in the browser tab and Google results."
              value={form.seo.title || ''}
              onChange={(event) => updateSeo('title', event.target.value)}
            />
          </div>
          <div className="form-field form-field--full">
            <label className="form-label">Meta description</label>
            <textarea
              className="form-textarea"
              rows={2}
              maxLength={300}
              placeholder="A short summary for search engines."
              value={form.seo.description || ''}
              onChange={(event) => updateSeo('description', event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* -------- Tip about featured items + actions -------- */}
      <div
        className="alert alert--info"
        style={{ marginTop: 'var(--space-6)' }}
      >
        <Icon name="info" size={18} />
        <span>
          The products, services and projects shown on the homepage are the ones marked as{' '}
          <strong>featured</strong>. Manage them in the{' '}
          <Link to="/admin/products">Products</Link>, <Link to="/admin/services">Services</Link> and{' '}
          <Link to="/admin/projects">Projects</Link> pages.
        </span>
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
          Save Homepage
        </Button>
      </div>
    </form>
  );
}
