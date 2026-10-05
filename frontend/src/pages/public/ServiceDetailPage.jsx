import { Link, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import Reveal from '../../components/common/Reveal';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import ServiceCard from '../../components/public/ServiceCard';
import ServiceIcon from '../../components/public/ServiceIcon';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { servicesApi } from '../../services/endpoints';
import { telLink, whatsappLink } from '../../utils/format';
import { imageSrc, resolveImageUrl } from '../../utils/image';

/**
 * Service detail page: overview, what's included, our process,
 * and quote/WhatsApp/call actions prefilled with the service name.
 */
export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => servicesApi.getBySlug(slug), [slug]);

  const service = data?.service;
  const related = data?.related || [];
  const companyName = settings.companyName || 'Decora';

  useDocumentMeta({
    title: service ? `${service.name} | ${companyName}` : `Services | ${companyName}`,
    description: service?.shortDescription || service?.description?.slice(0, 160),
    image: resolveImageUrl(service?.image?.url),
  });

  if (loading) return <LoadingBlock minHeight="70vh" label="Loading service…" />;

  if (error || !service) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="section container">
          <ErrorState
            title="Service not found"
            message="This service does not exist or is no longer offered."
            onRetry={() => reload()}
          />
          <div style={{ textAlign: 'center' }}>
            <Button to="/services" variant="secondary" icon="arrow-left">
              Back to Services
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const waHref = whatsappLink(
    settings.whatsapp || settings.phone,
    `Hello ${companyName}, I would like to know more about your "${service.name}" service.`
  );
  const quoteHref = `/quote?service=${encodeURIComponent(service.name)}`;

  return (
    <div style={{ paddingTop: 'var(--navbar-height)' }}>
      <section className="section">
        <div className="container">
          <nav className="breadcrumbs" aria-label="Breadcrumb" style={{ marginBottom: 'var(--space-6)' }}>
            <span className="breadcrumbs__item">
              <Link to="/">Home</Link>
              <span className="breadcrumbs__sep" aria-hidden="true">/</span>
            </span>
            <span className="breadcrumbs__item">
              <Link to="/services">Services</Link>
              <span className="breadcrumbs__sep" aria-hidden="true">/</span>
            </span>
            <span className="breadcrumbs__item">
              <span aria-current="page">{service.name}</span>
            </span>
          </nav>

          <div className="detail-layout">
            {/* -------- Main content -------- */}
            <div>
              {service.image?.url ? (
                <div className="gallery-main" style={{ marginBottom: 'var(--space-10)' }}>
                  <img src={imageSrc(service.image)} alt={service.image.alt || service.name} />
                </div>
              ) : null}

              {service.description ? (
                <div className="detail-section" style={{ marginTop: 0 }}>
                  <h2>Overview</h2>
                  <p style={{ color: 'var(--color-slate)', whiteSpace: 'pre-line' }}>
                    {service.description}
                  </p>
                </div>
              ) : null}

              {service.features?.length > 0 ? (
                <div className="detail-section">
                  <h2>What's Included</h2>
                  <ul className="feature-list">
                    {service.features.map((feature) => (
                      <li key={feature}>
                        <Icon name="check-circle" size={18} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {service.process?.length > 0 ? (
                <div className="detail-section">
                  <h2>How We Work</h2>
                  <div className="process-grid">
                    {service.process.map((step) => (
                      <div className="process-step" key={step.title}>
                        <h3>{step.title}</h3>
                        <p>{step.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {/* -------- Side panel -------- */}
            <aside className="info-panel">
              <span className="service-card__icon" aria-hidden="true">
                <ServiceIcon icon={service.icon} size={24} />
              </span>
              <h1 className="info-panel__title">{service.name}</h1>
              {service.shortDescription ? (
                <p className="info-panel__desc">{service.shortDescription}</p>
              ) : null}

              <div className="info-panel__actions">
                <Button to={quoteHref} variant="accent" icon="send" block>
                  Request This Service
                </Button>
                {waHref ? (
                  <Button href={waHref} variant="whatsapp" icon="whatsapp" block>
                    Discuss on WhatsApp
                  </Button>
                ) : null}
                {settings.phone ? (
                  <Button href={telLink(settings.phone)} variant="secondary" icon="phone" block>
                    {settings.phone}
                  </Button>
                ) : null}
              </div>
            </aside>
          </div>

          {/* -------- Related services -------- */}
          {related.length > 0 ? (
            <div className="related-strip">
              <h2 style={{ marginBottom: 'var(--space-6)' }}>Other Services</h2>
              <div className="grid grid--3">
                {related.map((item, index) => (
                  <Reveal key={item._id} delay={index * 60}>
                    <ServiceCard service={item} />
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
