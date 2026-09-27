import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import GalleryPicker from '../../components/admin/GalleryPicker';
import ImagePicker from '../../components/admin/ImagePicker';
import PairListInput from '../../components/admin/PairListInput';
import StringListInput from '../../components/admin/StringListInput';
import SwitchField from '../../components/admin/SwitchField';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { categoriesApi, productsApi } from '../../services/endpoints';

const EMPTY_FORM = {
  name: '',
  category: '',
  shortDescription: '',
  description: '',
  features: [],
  specifications: [],
  materials: [],
  colors: [],
  image: null,
  gallery: [],
  featured: false,
  isActive: true,
  sortOrder: 0,
};

/**
 * Create / edit a product. All catalog data lives in MongoDB; the form
 * mirrors the Product model one-to-one, including SEO-friendly images
 * with alt text.
 */
export default function ProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useDocumentMeta({ title: isEdit ? 'Edit Product | Admin' : 'New Product | Admin' });

  const { data: product, loading, error, reload } = useApi(
    () => (id ? productsApi.getById(id) : Promise.resolve(null)),
    [id]
  );

  const { data: categoriesData } = useApi(
    () => categoriesApi.list({ scope: 'product', limit: 200, includeInactive: 'true' }),
    []
  );
  const categories = categoriesData?.items || [];

  // Load the product into the form when editing.
  useEffect(() => {
    if (!product) return;
    setForm({
      name: product.name || '',
      category: product.category?._id || product.category || '',
      shortDescription: product.shortDescription || '',
      description: product.description || '',
      features: product.features || [],
      specifications: product.specifications || [],
      materials: product.materials || [],
      colors: product.colors || [],
      image: product.image || null,
      gallery: product.gallery || [],
      featured: Boolean(product.featured),
      isActive: Boolean(product.isActive),
      sortOrder: product.sortOrder || 0,
    });
  }, [product]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const validate = () => {
    const errors = {};
    const name = form.name.trim();
    if (name.length < 2 || name.length > 120) {
      errors.name = 'Product name is required (2-120 characters).';
    }
    if (!form.category) errors.category = 'Please choose a category.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    const payload = {
      ...form,
      name: form.name.trim(),
      shortDescription: form.shortDescription.trim(),
      description: form.description.trim(),
      features: form.features.map((item) => item.trim()).filter(Boolean),
      specifications: form.specifications.filter((spec) => spec.label?.trim() && spec.value?.trim()),
      materials: form.materials.map((item) => item.trim()).filter(Boolean),
      colors: form.colors.map((item) => item.trim()).filter(Boolean),
      image: form.image?.url ? { url: form.image.url, alt: form.image.alt || '' } : null,
      gallery: form.gallery.filter((image) => image.url),
      sortOrder: Number(form.sortOrder) || 0,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await productsApi.update(id, payload);
        toast.success('Product updated successfully.');
      } else {
        await productsApi.create(payload);
        toast.success('Product created successfully.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err?.message || 'Could not save the product.');
      setSaving(false);
    }
  };

  if (isEdit && loading) return <LoadingBlock label="Loading product…" minHeight="50vh" />;

  if (isEdit && (error || !product)) {
    return (
      <ErrorState
        title="Product not found"
        message={error?.message || 'This product does not exist.'}
        onRetry={() => reload()}
      />
    );
  }

  return (
    <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
      {/* -------- Basic information -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="package" size={18} />
          Basic Information
        </h2>
        <div className="form-grid">
          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="product-name">
              Product name <span className="required">*</span>
            </label>
            <input
              id="product-name"
              className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
              type="text"
              placeholder="e.g. Aluminum Sliding Window"
              value={form.name}
              maxLength={120}
              onChange={(event) => update('name', event.target.value)}
            />
            {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="product-category">
              Category <span className="required">*</span>
            </label>
            <select
              id="product-category"
              className={`form-select${fieldErrors.category ? ' form-select--error' : ''}`}
              value={form.category}
              onChange={(event) => update('category', event.target.value)}
            >
              <option value="">Select a category…</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>
            {fieldErrors.category ? (
              <span className="form-error">{fieldErrors.category}</span>
            ) : categories.length === 0 ? (
              <span className="form-hint">
                No categories yet — <Link to="/admin/categories">create one first</Link>.
              </span>
            ) : null}
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="product-sort">
              Sort order
            </label>
            <input
              id="product-sort"
              className="form-input"
              type="number"
              min={0}
              max={9999}
              value={form.sortOrder}
              onChange={(event) => update('sortOrder', event.target.value)}
            />
            <span className="form-hint">Lower numbers appear first in lists.</span>
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="product-short">
              Short description
            </label>
            <textarea
              id="product-short"
              className="form-textarea"
              rows={2}
              maxLength={300}
              placeholder="One or two sentences shown on product cards."
              value={form.shortDescription}
              onChange={(event) => update('shortDescription', event.target.value)}
            />
            <span className="form-hint">
              {form.shortDescription.length}/300 characters
            </span>
          </div>

          <div className="form-field form-field--full">
            <label className="form-label" htmlFor="product-description">
              Full description
            </label>
            <textarea
              id="product-description"
              className="form-textarea"
              rows={7}
              placeholder="Describe the product, its use cases and what makes it a good choice."
              value={form.description}
              onChange={(event) => update('description', event.target.value)}
            />
          </div>
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
            label="Main image"
            value={form.image}
            onChange={(image) => update('image', image)}
            hint="Shown on cards, search results and as the first gallery image."
          />
          <GalleryPicker
            label="Gallery images (up to 12)"
            value={form.gallery}
            onChange={(gallery) => update('gallery', gallery)}
            hint="Add finishing details, close-ups or installed examples."
          />
        </div>
      </div>

      {/* -------- Details -------- */}
      <div className="admin-form-section">
        <h2 className="admin-form-section__title">
          <Icon name="list" size={18} />
          Details
        </h2>
        <div className="form-grid">
          <StringListInput
            label="Key features"
            value={form.features}
            onChange={(features) => update('features', features)}
            placeholder="e.g. Powder-coated aluminum frame"
            addLabel="Add feature"
          />
          <PairListInput
            label="Specifications"
            value={form.specifications}
            onChange={(specifications) => update('specifications', specifications)}
            fields={[
              { key: 'label', placeholder: 'Label (e.g. Frame thickness)', width: 1 },
              { key: 'value', placeholder: 'Value (e.g. 2.0 mm)', width: 1.4 },
            ]}
            addLabel="Add specification"
          />
          <StringListInput
            label="Materials"
            value={form.materials}
            onChange={(materials) => update('materials', materials)}
            placeholder="e.g. Tempered glass"
            addLabel="Add material"
          />
          <StringListInput
            label="Available finishes / colors"
            value={form.colors}
            onChange={(colors) => update('colors', colors)}
            placeholder="e.g. Matte black"
            addLabel="Add finish"
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
        <Button variant="ghost" onClick={() => navigate('/admin/products')} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="accent" loading={saving} icon="check">
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
