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

/** Mirrors the backend limit in backend/src/models/Homepage.js. */
const MAX_HERO_SLIDES = 8;

/** A slide is worth keeping if it has an image or any text. */
function hasSlideContent(slide) {
  return Boolean(
    slide &&
      (slide.backgroundImage?.url ||
        String(slide.heading || '').trim() ||
        String(slide.subheading || '').trim() ||
        String(slide.description || '').trim())
  );
}

/**
 * Records created before the hero slider existed only have the single-hero
 * fields. Turn those into a single slide so the editor always shows slides
 * and saving migrates the document without losing anything.
 */
function withHeroSlides(homepage) {
  const hero = homepage.hero || {};
  const existing = (hero.slides || []).filter(hasSlideContent);

  return {
    ...homepage,
    hero: {
      ...hero,
      slides:
        existing.length > 0
          ? existing
          : [
              {
                heading: hero.heading || '',
                subheading: hero.subheading || '',
                description: hero.description || '',
                backgroundImage: hero.backgroundImage || null,
                buttons: hero.buttons || [],
              },
            ],
    },
  };
}

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
    if (homepage) setForm(withHeroSlides(homepage));
  }, [homepage]);

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

  // --- Hero slides ---

  /** Patches one field of one slide. */
  const updateSlide = (index, key, value) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.map((slide, i) =>
          i === index ? { ...slide, [key]: value } : slide
        ),
      },
    }));

  /** Patches one button of one slide. */
  const updateSlideButton = (slideIndex, buttonIndex, key, value) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.map((slide, i) =>
          i === slideIndex
            ? {
                ...slide,
                buttons: (slide.buttons || []).map((button, b) =>
                  b === buttonIndex ? { ...button, [key]: value } : button
                ),
              }
            : slide
        ),
      },
    }));

  const addSlideButton = (slideIndex) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.map((slide, i) =>
          i === slideIndex
            ? { ...slide, buttons: [...(slide.buttons || []), { label: '', link: '', variant: 'primary' }] }
            : slide
        ),
      },
    }));

  const removeSlideButton = (slideIndex, buttonIndex) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: current.hero.slides.map((slide, i) =>
          i === slideIndex
            ? { ...slide, buttons: (slide.buttons || []).filter((_, b) => b !== buttonIndex) }
            : slide
        ),
      },
    }));

  const addSlide = () =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: [
          ...(current.hero.slides || []),
          { heading: '', subheading: '', description: '', backgroundImage: null, buttons: [] },
        ].slice(0, MAX_HERO_SLIDES),
      },
    }));

  const removeSlide = (index) =>
    setForm((current) => ({
      ...current,
      hero: {
        ...current.hero,
        slides: (current.hero.slides || []).filter((_, i) => i !== index),
      },
    }));

  /** Moves a slide one position up (-1) or down (+1). */
  const moveSlide = (index, offset) =>
    setForm((current) => {
      const slides = [...(current.hero.slides || [])];
      const target = index + offset;
      if (target < 0 || target >= slides.length) return current;
      const [moved] = slides.splice(index, 1);
      slides.splice(target, 0, moved);
      return { ...current, hero: { ...current.hero, slides } };
    });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !form) return;

    // Empty slides and half-filled buttons are dropped before saving.
    const slides = (form.hero.slides || [])
      .map((slide) => ({
        heading: slide.heading || '',
        subheading: slide.subheading || '',
        description: slide.description || '',
        backgroundImage: slide.backgroundImage?.url ? slide.backgroundImage : null,
        buttons: (slide.buttons || []).filter((button) => button.label?.trim() && button.link?.trim()),
      }))
      .filter(
        (slide) =>
          slide.backgroundImage || slide.heading.trim() || slide.subheading.trim() || slide.description.trim()
      );

    const payload = {
      hero: {
        ...form.hero,
        slides,
        backgroundImage: slides[0]?.backgroundImage || null,
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
      {/* -------- Hero slider -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="sparkle" size={18} />
          Hero Slider
        </h2>
        <p className="form-hint" style={{ marginBottom: 'var(--space-4)' }}>
          Up to {MAX_HERO_SLIDES} slides, shown one at a time on the homepage and rotating
          automatically. Slide 1 is what visitors see first. With a single slide the hero shows
          no arrows or dots - just a normal banner.
        </p>

        <div className="repeat-list">
          {(form.hero.slides || []).map((slide, slideIndex) => (
            <div className="admin-form-card admin-form-card--nested" key={slide._id || `slide-${slideIndex}`}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <strong style={{ fontSize: 'var(--text-sm)' }}>
                  Slide {slideIndex + 1}
                  {slideIndex === 0 ? ' (first)' : ''}
                </strong>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveSlide(slideIndex, -1)}
                    disabled={slideIndex === 0}
                    aria-label={`Move slide ${slideIndex + 1} up`}
                  >
                    <Icon name="arrow-up" size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => moveSlide(slideIndex, 1)}
                    disabled={slideIndex === (form.hero.slides || []).length - 1}
                    aria-label={`Move slide ${slideIndex + 1} down`}
                  >
                    <Icon name="arrow-down" size={16} />
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => removeSlide(slideIndex)}
                    aria-label={`Remove slide ${slideIndex + 1}`}
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              <div className="form-grid">
                <ImagePicker
                  label="Background image"
                  value={slide.backgroundImage}
                  onChange={(image) => updateSlide(slideIndex, 'backgroundImage', image)}
                  hint="A wide, high-quality photo works best - landscape, 1600px or wider. Text stays readable over the dark overlay."
                />

                <div className="form-field form-field--full">
                  <label className="form-label">Heading</label>
                  <input
                    className="form-input"
                    type="text"
                    maxLength={200}
                    placeholder="The big line visitors read first."
                    value={slide.heading || ''}
                    onChange={(event) => updateSlide(slideIndex, 'heading', event.target.value)}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label className="form-label">Subheading</label>
                  <input
                    className="form-input"
                    type="text"
                    maxLength={300}
                    placeholder="Short supporting line above the heading."
                    value={slide.subheading || ''}
                    onChange={(event) => updateSlide(slideIndex, 'subheading', event.target.value)}
                  />
                </div>
                <div className="form-field form-field--full">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    maxLength={800}
                    placeholder="A sentence or two about what you do."
                    value={slide.description || ''}
                    onChange={(event) => updateSlide(slideIndex, 'description', event.target.value)}
                  />
                </div>

                <div className="form-field form-field--full">
                  <span className="form-label">Buttons</span>
                  {(slide.buttons || []).length > 0 ? (
                    <div className="repeat-list">
                      {(slide.buttons || []).map((button, buttonIndex) => (
                        <div className="repeat-row" key={buttonIndex}>
                          <input
                            className="form-input"
                            type="text"
                            placeholder="Label (e.g. Request a Quote)"
                            value={button.label || ''}
                            onChange={(event) =>
                              updateSlideButton(slideIndex, buttonIndex, 'label', event.target.value)
                            }
                          />
                          <input
                            className="form-input"
                            type="text"
                            placeholder="Link (e.g. /quote)"
                            value={button.link || ''}
                            onChange={(event) =>
                              updateSlideButton(slideIndex, buttonIndex, 'link', event.target.value)
                            }
                          />
                          <select
                            className="form-select"
                            style={{ maxWidth: 190 }}
                            value={button.variant || 'primary'}
                            onChange={(event) =>
                              updateSlideButton(slideIndex, buttonIndex, 'variant', event.target.value)
                            }
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
                            onClick={() => removeSlideButton(slideIndex, buttonIndex)}
                            aria-label="Remove button"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="form-hint">No buttons on this slide.</span>
                  )}
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      icon="plus"
                      onClick={() => addSlideButton(slideIndex)}
                    >
                      Add button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            icon="plus"
            onClick={addSlide}
            disabled={(form.hero.slides || []).length >= MAX_HERO_SLIDES}
          >
            Add slide
          </Button>
          {(form.hero.slides || []).length >= MAX_HERO_SLIDES ? (
            <span className="form-hint" style={{ marginLeft: 'var(--space-3)' }}>
              Maximum of {MAX_HERO_SLIDES} slides reached.
            </span>
          ) : null}
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
