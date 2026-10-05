import { Link } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import LazyImage from '../../components/common/LazyImage';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import HeroSlider from '../../components/public/HeroSlider';
import ProductCard from '../../components/public/ProductCard';
import ProjectCard from '../../components/public/ProjectCard';
import ServiceCard from '../../components/public/ServiceCard';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { homepageApi } from '../../services/endpoints';

/** Icon rotation for the "why choose us" items (content is dashboard-managed). */
const WHY_US_ICONS = ['award', 'tool', 'ruler', 'shield', 'tag', 'layers', 'heart', 'sparkle'];

/**
 * The hero is a slider. Older records only have the single-hero fields, so
 * fall back to building one slide from them - that keeps rendering working
 * before anything is migrated in the dashboard.
 */
function toHeroSlides(hero) {
  if (!hero) return [];

  const slides = (hero.slides || []).filter(
    (slide) => slide && (slide.backgroundImage || slide.heading || slide.subheading || slide.description)
  );
  if (slides.length > 0) return slides;

  return [
    {
      heading: hero.heading,
      subheading: hero.subheading,
      description: hero.description,
      backgroundImage: hero.backgroundImage,
      buttons: hero.buttons || [],
    },
  ];
}

/**
 * Homepage - every word, image and link on this page is loaded from
 * MongoDB via /api/homepage and can be edited in the dashboard.
 */
export default function HomePage() {
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => homepageApi.get(), []);

  const homepage = data?.homepage;
  const featuredProducts = data?.featuredProducts || [];
  const featuredServices = data?.featuredServices || [];
  const featuredProjects = data?.featuredProjects || [];

  useDocumentMeta({
    title: homepage?.seo?.title || settings.defaultMeta?.title,
    description: homepage?.seo?.description || settings.defaultMeta?.description,
  });

  if (loading) return <LoadingBlock minHeight="80vh" label="Loading homepage…" />;
  if (error || !homepage) {
    return (
      <div className="section container">
        <ErrorState
          title="We could not load the homepage"
          message="Please check your connection and try again."
          onRetry={() => reload()}
        />
      </div>
    );
  }

  const { hero, about, sections, cta } = homepage;
  const heroSlides = toHeroSlides(hero);
  const trustItems = [
    settings.phone ? { icon: 'phone', text: settings.phone } : null,
    settings.email ? { icon: 'mail', text: settings.email } : null,
    settings.address ? { icon: 'map-pin', text: settings.address } : null,
    settings.businessHours?.[0]
      ? { icon: 'clock', text: `${settings.businessHours[0].days}: ${settings.businessHours[0].hours}` }
      : null,
  ].filter(Boolean);

  const statsEnabled = sections?.stats?.enabled && sections.stats.items?.length > 0;

  return (
    <>
      {/* ================= Hero slider ================= */}
      <HeroSlider slides={heroSlides} />

      {/* ================= Trust strip ================= */}
      {trustItems.length > 0 && (
        <div className="trust-strip" id="explore">
          <div className="container trust-strip__inner">
            {trustItems.map((item) => (
              <span className="trust-strip__item" key={item.text}>
                <Icon name={item.icon} size={18} />
                {item.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ================= About ================= */}
      {about?.heading ? (
        <section className="section">
          <div className="container split">
            <Reveal className="split__media">
              <LazyImage image={about.image} alt={about.heading} />
              <span className="split__frame" aria-hidden="true" />
            </Reveal>
            <Reveal className="split__body" delay={120}>
              <SectionHeading
                eyebrow="Who We Are"
                title={about.heading}
                description={about.description}
              />
              {about.ctaLabel ? (
                <Button to={about.ctaLink || '/about'} variant="primary" iconRight="arrow-right">
                  {about.ctaLabel}
                </Button>
              ) : null}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ================= Featured products ================= */}
      {sections?.products?.enabled && featuredProducts.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="Catalog"
                title={sections.products.heading || 'Our Products'}
                description={sections.products.subheading}
                action={
                  <Link className="link-arrow" to="/products">
                    View all products
                    <Icon name="arrow-right" size={16} />
                  </Link>
                }
              />
            </Reveal>
            <div className="grid grid--3">
              {featuredProducts.slice(0, 6).map((product, index) => (
                <Reveal key={product._id} delay={index * 80}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Services ================= */}
      {sections?.services?.enabled && featuredServices.length > 0 ? (
        <section className="section">
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="What We Do"
                title={sections.services.heading || 'Our Services'}
                description={sections.services.subheading}
                action={
                  <Link className="link-arrow" to="/services">
                    All services
                    <Icon name="arrow-right" size={16} />
                  </Link>
                }
              />
            </Reveal>
            <div className="grid grid--3">
              {featuredServices.slice(0, 6).map((service, index) => (
                <Reveal key={service._id} delay={index * 80}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Why choose us ================= */}
      {sections?.whyUs?.enabled && sections.whyUs.items?.length > 0 ? (
        <section className="section section--dark">
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="Why Decora"
                title={sections.whyUs.heading || 'Why Choose Us'}
                description={sections.whyUs.subheading}
                center
              />
            </Reveal>
            <div className="why-grid">
              {sections.whyUs.items.map((item, index) => (
                <Reveal className="why-item" key={item.title} delay={index * 70}>
                  <span className="why-item__icon" aria-hidden="true">
                    <Icon name={WHY_US_ICONS[index % WHY_US_ICONS.length]} size={20} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Stats (optional, dashboard-controlled) ================= */}
      {statsEnabled ? (
        <section className="section section--tight">
          <div className="container stats-grid">
            {sections.stats.items.map((stat) => (
              <div key={stat.label}>
                <div className="stat__value">
                  {stat.value}
                  {stat.suffix || ''}
                </div>
                <div className="stat__label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {/* ================= Featured projects ================= */}
      {sections?.projects?.enabled && featuredProjects.length > 0 ? (
        <section className="section section--soft">
          <div className="container">
            <Reveal>
              <SectionHeading
                eyebrow="Portfolio"
                title={sections.projects.heading || 'Recent Projects'}
                description={sections.projects.subheading}
                action={
                  <Link className="link-arrow" to="/projects">
                    View all projects
                    <Icon name="arrow-right" size={16} />
                  </Link>
                }
              />
            </Reveal>
            <div className="grid grid--3">
              {featuredProjects.slice(0, 6).map((project, index) => (
                <Reveal key={project._id} delay={index * 80}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= Call to action ================= */}
      {cta?.heading ? (
        <section className="section">
          <div className="container">
            <Reveal className="cta-band">
              <h2>{cta.heading}</h2>
              {cta.description ? <p>{cta.description}</p> : null}
              <div className="cta-band__actions">
                {cta.primaryLabel ? (
                  <Button to={cta.primaryLink || '/quote'} variant="accent" size="lg" icon="send">
                    {cta.primaryLabel}
                  </Button>
                ) : null}
                {cta.secondaryLabel ? (
                  <Button
                    to={cta.secondaryLink || '/contact'}
                    variant="ghost"
                    size="lg"
                    iconRight="arrow-right"
                  >
                    {cta.secondaryLabel}
                  </Button>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}
    </>
  );
}
