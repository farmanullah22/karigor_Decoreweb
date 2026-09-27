import { Link, useParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import LazyImage from '../../components/common/LazyImage';
import Reveal from '../../components/common/Reveal';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import ProjectCard from '../../components/public/ProjectCard';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { projectsApi } from '../../services/endpoints';
import { formatDate, projectTypeLabel } from '../../utils/format';
import { imageSrc, resolveImageUrl } from '../../utils/image';

/**
 * Project case study page: cover image, key facts, scope of work,
 * materials, image gallery and related projects.
 */
export default function ProjectDetailPage() {
  const { slug } = useParams();
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => projectsApi.getBySlug(slug), [slug]);

  const project = data?.project;
  const related = data?.related || [];
  const companyName = settings.companyName || 'Karigor Decore';

  useDocumentMeta({
    title: project ? `${project.name} | ${companyName}` : `Projects | ${companyName}`,
    description: project?.shortDescription || project?.description?.slice(0, 160),
    image: resolveImageUrl(project?.coverImage?.url),
  });

  if (loading) return <LoadingBlock minHeight="70vh" label="Loading project…" />;

  if (error || !project) {
    return (
      <div style={{ paddingTop: 'var(--navbar-height)' }}>
        <div className="section container">
          <ErrorState
            title="Project not found"
            message="This project does not exist or has been unpublished."
            onRetry={() => reload()}
          />
          <div style={{ textAlign: 'center' }}>
            <Button to="/projects" variant="secondary" icon="arrow-left">
              Back to Projects
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const gallery = (project.gallery || []).filter((image) => image && image.url);
  const quoteHref = `/quote?product=${encodeURIComponent(project.name)}&type=${project.category || ''}`;

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
              <Link to="/projects">Projects</Link>
              <span className="breadcrumbs__sep" aria-hidden="true">/</span>
            </span>
            <span className="breadcrumbs__item">
              <span aria-current="page">{project.name}</span>
            </span>
          </nav>

          {/* Header: title + key facts */}
          <div className="detail-layout">
            <div>
              {project.category ? (
                <span className="project-card__category">{project.category}</span>
              ) : null}
              <h1 style={{ fontSize: 'var(--text-4xl)', marginBottom: 'var(--space-5)' }}>
                {project.name}
              </h1>
              {project.shortDescription ? (
                <p style={{ fontSize: 'var(--text-lg)', color: 'var(--color-muted)' }}>
                  {project.shortDescription}
                </p>
              ) : null}
            </div>

            <aside className="info-panel">
              <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-5)' }}>
                Project Facts
              </h3>
              <dl className="info-panel__meta" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
                {project.category ? (
                  <div className="info-panel__meta-row">
                    <dt>Category</dt>
                    <dd>{project.category}</dd>
                  </div>
                ) : null}
                {project.location ? (
                  <div className="info-panel__meta-row">
                    <dt>Location</dt>
                    <dd>{project.location}</dd>
                  </div>
                ) : null}
                {project.completionDate ? (
                  <div className="info-panel__meta-row">
                    <dt>Completed</dt>
                    <dd>{formatDate(project.completionDate, { month: 'long' })}</dd>
                  </div>
                ) : null}
                {project.servicesProvided?.length > 0 ? (
                  <div className="info-panel__meta-row">
                    <dt>Scope</dt>
                    <dd>{project.servicesProvided.length} services</dd>
                  </div>
                ) : null}
              </dl>
              <div className="info-panel__actions" style={{ marginTop: 'var(--space-6)' }}>
                <Button to={quoteHref} variant="accent" icon="send" block>
                  Start a Similar Project
                </Button>
              </div>
            </aside>
          </div>

          {/* Cover image */}
          <div className="gallery-main" style={{ marginTop: 'var(--space-10)', aspectRatio: '16 / 9' }}>
            <img
              src={imageSrc(project.coverImage)}
              alt={project.coverImage?.alt || project.name}
            />
          </div>

          {/* Description */}
          {project.description ? (
            <div className="detail-section">
              <h2>About This Project</h2>
              <p style={{ color: 'var(--color-slate)', whiteSpace: 'pre-line' }}>
                {project.description}
              </p>
            </div>
          ) : null}

          {/* Scope + materials */}
          <div className="detail-section">
            <div className="split">
              {project.servicesProvided?.length > 0 ? (
                <div>
                  <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>
                    Scope of Work
                  </h2>
                  <ul className="feature-list" style={{ gridTemplateColumns: '1fr' }}>
                    {project.servicesProvided.map((item) => (
                      <li key={item}>
                        <Icon name="check-circle" size={18} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {project.materialsUsed?.length > 0 ? (
                <div>
                  <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-5)' }}>
                    Materials Used
                  </h2>
                  <div className="tag-row">
                    {project.materialsUsed.map((material) => (
                      <span className="tag" key={material}>{material}</span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Gallery */}
          {gallery.length > 0 ? (
            <div className="detail-section">
              <h2>Project Gallery</h2>
              <div className="grid grid--3">
                {gallery.map((image, index) => (
                  <Reveal key={`${image.url}-${index}`} delay={(index % 3) * 60}>
                    <div className="gallery-main" style={{ aspectRatio: '4 / 3' }}>
                      <LazyImage image={image} alt={`${project.name} - photo ${index + 1}`} />
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          {/* Related projects */}
          {related.length > 0 ? (
            <div className="related-strip">
              <h2 style={{ marginBottom: 'var(--space-6)' }}>More Projects</h2>
              <div className="grid grid--3">
                {related.map((item, index) => (
                  <Reveal key={item._id} delay={index * 60}>
                    <ProjectCard project={item} />
                  </Reveal>
                ))}
              </div>
            </div>
          ) : null}

          {/* Bottom CTA */}
          <div className="related-strip">
            <div className="cta-band">
              <h2>Like What You See?</h2>
              <p>
                We can deliver the same quality for your {projectTypeLabel(project.category).toLowerCase() || ''} space.
                Request a quote and let's talk details.
              </p>
              <div className="cta-band__actions">
                <Button to="/quote" variant="accent" size="lg" icon="send">
                  Request a Quote
                </Button>
                <Button to="/projects" variant="ghost" size="lg" iconRight="arrow-right">
                  All Projects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
