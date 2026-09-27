import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import LazyImage from '../../components/common/LazyImage';
import Reveal from '../../components/common/Reveal';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import ProductCard from '../../components/public/ProductCard';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { productsApi } from '../../services/endpoints';
import { telLink, truncate, whatsappLink } from '../../utils/format';
import { imageSrc, resolveImageUrl } from '../../utils/image';

/**
 * Product detail page with image gallery, features, specifications and
 * related products. "Request a Quote" prefills the quote form with the
 * product name, and WhatsApp/call shortcuts use company settings.
 */
export default function ProductDetailPage() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => productsApi.getBySlug(slug), [slug]);
  const [activeImage, setActiveImage] = useState(0);

  const product = data?.product;
  const related = data?.related || [];

  useEffect(() => {
    setActiveImage(0);
  }, [slug]);

  const companyName = settings.companyName || 'Karigor Decore';

  useDocumentMeta({
    title: product ? `${product.name} | ${companyName}` : `Product | ${companyName}`,
    description: product?.shortDescription || product?.description?.slice(0, 160),
    image: resolveImageUrl(product?.image?.url),
  });

  if (loading) return <LoadingBlock minHeight="70vh" label="Loading product…" />;

  if (error || !product) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="section container">
          <ErrorState
            title="Product not found"
            message="This product does not exist or is no longer available."
            onRetry={() => reload()}
          />
          <div style={{ textAlign: 'center' }}>
            <Button to="/products" variant="secondary" icon="arrow-left">
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = [product.image, ...(product.gallery || [])].filter((img) => img && img.url);
  const currentImage = galleryImages[activeImage] || product.image;

  const waHref = whatsappLink(
    settings.whatsapp || settings.phone,
    `Hello ${companyName}, I am interested in "${product.name}". Could you share more details?`
  );
  const quoteHref = `/quote?product=${encodeURIComponent(product.name)}`;

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <section className="section">
        <div className="container">
          {/* Breadcrumbs */}
          <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="breadcrumbs__item">
              <Link to="/">Home</Link>
              <span className="breadcrumbs__sep" aria-hidden="true">/</span>
            </span>
            <span className="breadcrumbs__item">
              <Link to="/products">Products</Link>
              <span className="breadcrumbs__sep" aria-hidden="true">/</span>
            </span>
            <span className="breadcrumbs__item">
              <span aria-current="page">{product.name}</span>
            </span>
          </nav>

          <div className="detail-layout">
            {/* -------- Gallery + details -------- */}
            <div>
              <div className="gallery-main">
                <img src={imageSrc(currentImage)} alt={currentImage?.alt || product.name} />
              </div>
              {galleryImages.length > 1 && (
                <div className="gallery-thumbs">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image.url}-${index}`}
                      type="button"
                      className={`gallery-thumb${index === activeImage ? ' gallery-thumb--active' : ''}`}
                      onClick={() => setActiveImage(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={imageSrc(image)} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}

              {product.description ? (
                <div className="detail-section">
                  <h2>Description</h2>
                  <p style={{ color: 'var(--color-slate)', whiteSpace: 'pre-line' }}>
                    {product.description}
                  </p>
                </div>
              ) : null}

              {product.features?.length > 0 ? (
                <div className="detail-section">
                  <h2>Key Features</h2>
                  <ul className="feature-list">
                    {product.features.map((feature) => (
                      <li key={feature}>
                        <Icon name="check-circle" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {product.specifications?.length > 0 ? (
                <div className="detail-section">
                  <h2>Specifications</h2>
                  <table className="spec-table">
                    <tbody>
                      {product.specifications.map((spec) => (
                        <tr key={`${spec.label}-${spec.value}`}>
                          <th scope="row">{spec.label}</th>
                          <td>{spec.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              {product.materials?.length > 0 ? (
                <div className="detail-section">
                  <h2>Materials</h2>
                  <div className="tag-row">
                    {product.materials.map((material) => (
                      <span className="tag" key={material}>{material}</span>
                    ))}
                  </div>
                </div>
              ) : null}

              {product.colors?.length > 0 ? (
                <div className="detail-section">
                  <h2>Available Finishes</h2>
                  <div className="tag-row">
                    {product.colors.map((color) => (
                      <span className="tag" key={color}>{color}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* -------- Sticky info panel -------- */}
            <aside className="info-panel">
              {product.category?.name ? (
                <Link to={`/products?category=${product.category.slug}`} className="badge badge--accent">
                  {product.category.name}
                </Link>
              ) : null}
              <h1 className="info-panel__title">{product.name}</h1>
              {product.shortDescription ? (
                <p className="info-panel__desc">{product.shortDescription}</p>
              ) : null}

              <div className="info-panel__actions">
                <Button to={quoteHref} variant="accent" icon="send" block>
                  Request a Quote
                </Button>
                {waHref ? (
                  <Button href={waHref} variant="whatsapp" icon="whatsapp" block>
                    Ask on WhatsApp
                  </Button>
                ) : null}
                {settings.phone ? (
                  <Button href={telLink(settings.phone)} variant="secondary" icon="phone" block>
                    {settings.phone}
                  </Button>
                ) : null}
              </div>

              <dl className="info-panel__meta">
                {product.category?.name ? (
                  <div className="info-panel__meta-row">
                    <dt>Category</dt>
                    <dd>{product.category.name}</dd>
                  </div>
                ) : null}
                {product.materials?.length > 0 ? (
                  <div className="info-panel__meta-row">
                    <dt>Materials</dt>
                    <dd>{product.materials.join(', ')}</dd>
                  </div>
                ) : null}
                {product.colors?.length > 0 ? (
                  <div className="info-panel__meta-row">
                    <dt>Finishes</dt>
                    <dd>{truncate(product.colors.join(', '), 60)}</dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>

          {/* -------- Related products -------- */}
          {related.length > 0 ? (
            <div className="related-strip">
              <h2 style={{ marginBottom: 'var(--space-6)' }}>Related Products</h2>
              <div className="grid grid--4">
                {related.map((item, index) => (
                  <Reveal key={item._id} delay={index * 60}>
                    <ProductCard product={item} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
