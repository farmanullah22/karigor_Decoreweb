import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import GalleryPicker from '../../components/admin/GalleryPicker';
import ImagePicker from '../../components/admin/ImagePicker';
import StringListInput from '../../components/admin/StringListInput';
import SwitchField from '../../components/admin/SwitchField';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { categoriesApi, projectsApi } from '../../services/endpoints';

const EMPTY_FORM = {
  name: '',
  category: '',
  location: '',
  completionDate: '',
  shortDescription: '',
  description: '',
  servicesProvided: [],
  materialsUsed: [],
  coverImage: null,
  gallery: [],
  featured: false,
  isActive: true,
  sortOrder: 0,
};

/** Converts a stored date into the yyyy-mm-dd format a date input expects. */
function toDateInputValue(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

/**
 * Create / edit a portfolio project (case study): location, completion
 * date, scope of work, materials and before/after style gallery.
 */
export default function ProjectFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useDocumentMeta({ title: isEdit ? 'Edit Project | Admin' : 'New Project | Admin' });

  const { data: project, loading, error, reload } = useApi(
    () => (id ? projectsApi.getById(id) : Promise.resolve(null)),
    [id]
  );

  // Category suggestions: categories of scope "project" + categories already used.
  const { data: projectCategories } = useApi(
    () => categoriesApi.list({ scope: 'project', limit: 200, includeInactive: 'true' }),
    []
  );
  const { data: usedCategories } = useApi(() => projectsApi.listCategories(), []);

  const categorySuggestions = useMemo(() => {
    const names = new Set();
    (projectCategories?.items || []).forEach((item) => names.add(item.name));
    (Array.isArray(usedCategories) ? usedCategories : []).forEach((name) => names.add(name));
    if (project?.category) names.add(project.category);
    return Array.from(names).filter(Boolean);
  }, [projectCategories, usedCategories, project]);

  // Load the project into the form when editing.
  useEffect(() => {
    if (!project) return;
    setForm({
      name: project.name || '',
      category: project.category || '',
      location: project.location || '',
      completionDate: toDateInputValue(project.completionDate),
      shortDescription: project.shortDescription || '',
      description: project.description || '',
      servicesProvided: project.servicesProvided || [],
      materialsUsed: project.materialsUsed || [],
      coverImage: project.coverImage || null,
      gallery: project.gallery || [],
      featured: Boolean(project.featured),
      isActive: Boolean(project.isActive),
      sortOrder: project.sortOrder || 0,
    });
  }, [project]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    if (name.length < 2 || name.length > 140) {
      setFieldErrors({ name: 'Project name is required (2-140 characters).' });
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setFieldErrors({});

    const payload = {
      ...form,
      name,
      category: form.category.trim(),
      location: form.location.trim(),
      completionDate: form.completionDate ? new Date(form.completionDate).toISOString() : null,
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      servicesProvided: form.servicesProvided.map((item) => item.trim()).filter(Boolean),
      materialsUsed: form.materialsUsed.map((item) => item.trim()).filter(Boolean),
      coverImage: form.coverImage?.url
        ? { url: form.coverImage.url, alt: form.coverImage.alt || '' }
        : null,
      gallery: form.gallery.filter((image) => image.url),
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await projectsApi.update(id, payload);
        toast.success('Project updated successfully.');
      } else {
        await projectsApi.create(payload);
        toast.success('Project created successfully.');
      }
      navigate('/admin/projects');
    } catch (err) {
      toast.error(err?.message || 'Could not save the project.');
      setSaving(false);
    }
  };

  if (isEdit && loading) return <LoadingBlock label="Loading project…" minHeight="50vh" />;

  if (isEdit && (error || !project)) {
    return (
      <ErrorState
        title="Project not found"
        message={error?.message || 'This project does not exist.'}
        onRetry={() => reload()}
      />
    );
  }

  return (
    <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
      {/* -------- Basic information -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="briefcase" size={18} />
          Basic Information
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="project-name">
              Project name <span className="required">*</span>
            </label>
            <input
              id="project-name"
              className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
              type="text"
              maxLength={140}
              placeholder="e.g. Lakeside Villa Window Renovation"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
            />
            {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="project-category">
              Category
            </label>
            <input
              id="project-category"
              className="form-input"
              type="text"
              list="project-category-suggestions"
              maxLength={80}
              placeholder="e.g. Residential"
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
            />
            <datalist id="project-category-suggestions">
              {categorySuggestions.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <span className="form-hint">Used for the portfolio filters on the website.</span>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="project-location">
              Location
            </label>
            <input
              id="project-location"
              className="form-input"
              type="text"
              maxLength={160}
              placeholder="e.g. Hayatabad, Peshawar"
              value={form.location}
              onChange={(event) => update('location', event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="project-date">
              Completion date
            </label>
            <input
              id="project-date"
              className="form-input"
              type="date"
              value={form.completionDate}
              onChange={(event) => update('completionDate', event.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="project-sort">
              Sort order
            </label>
            <input
              id="project-sort"
              className="form-input"
              type="number"
              min={0}
              max={9999}
              value={form.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="project-short">
              Short description
            </label>
            <textarea
              id="project-short"
              className="form-textarea"
              rows={2}
              maxLength={300}
              placeholder="One or two sentences shown on project cards."
              value={form.shortDescription}
              onChange={(event) => update('shortDescription', event.target.value)}
            />
            <span className="form-hint">{form.shortDescription.length}/300 characters</span>
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="project-description">
              Full case study
            </label>
            <textarea
              id="project-description"
              className="form-textarea"
              rows={8}
              placeholder="Tell the story: the challenge, the solution and the result."
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>
        </div>
      </div>

      {/* -------- Scope & materials -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="list" size={18} />
          Scope & Materials
        </h2>
        <div className="form-grid">
          <StringListInput
            label="Services provided"
            value={form.servicesProvided}
            onChange={(servicesProvided) => update('servicesProvided', servicesProvided)}
            placeholder="e.g. Aluminum window installation"
            addLabel="Add service"
          />
          <StringListInput
            label="Materials used"
            value={form.materialsUsed}
            onChange={(materialsUsed) => update('materialsUsed', materialsUsed)}
            placeholder="e.g. Double-glazed tempered glass"
            addLabel="Add material"
          />
        </div>
      </div>

      {/* -------- Images -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="image" size={18} />
          Images
        </h2>
        <div className="form-grid">
          <ImagePicker
            label="Cover image"
            value={form.coverImage}
            onChange={(coverImage) => update('coverImage', coverImage)}
            hint="The main image shown in the portfolio grid and project header."
          />
          <GalleryPicker
            label="Gallery images (up to 20)"
            value={form.gallery}
            onChange={(gallery) => update('gallery', gallery)}
            hint="Progress shots, details and the finished result."
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
        <Button variant="ghost" onClick={() => navigate('/admin/projects')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={saving} icon="check">
          {isEdit ? 'Save Changes' : 'Create Project'}
        </Button>
      </div>
    </form>
  );
}
