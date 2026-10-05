import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import LazyImage from '../../components/common/LazyImage';
import PageHeader from '../../components/common/PageHeader';
import Reveal from '../../components/common/Reveal';
import SectionHeading from '../../components/common/SectionHeading';
import { ErrorState, LoadingBlock } from '../../components/common/States';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { homepageApi } from '../../services/endpoints';
import { telLink } from '../../utils/format';

const VALUE_ICONS = ['award', 'tool', 'ruler', 'shield', 'tag', 'layers', 'heart', 'sparkle'];

/**
 * About page. Story, image and values all come from the dashboard-editable
 * homepage/about content plus company settings - nothing hard-coded.
 */
export default function AboutPage() {
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => homepageApi.get(), []);

  const about = data?.homepage?.about;
  const whyUs = data?.homepage?.sections?.whyUs;
  const companyName = settings.companyName || 'Decora';

  useDocumentMeta({
    title: `About Us | ${companyName}`,
    description: about?.description?.slice(0, 160) || settings.defaultMeta?.description,
  });

  return (
    <>
      <PageHeader
        eyebrow="About Us"
        title={about?.heading || `About ${companyName}`}
        description={settings.tagline}
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'About' }]}
      />

      {loading ? (
        <div className="section container">
          <LoadingBlock />
        </div>
      ) : error ? (
        <div className="section container">
          <ErrorState onRetry={() => reload()} />
        </div>
      ) : (
        <>
          {/* Story */}
          <section className="section">
            <div className="container split split--reverse">
              <Reveal className="split__media">
                <LazyImage image={about?.image} alt={`${companyName} workshop`} />
                <span className="split__frame" aria-hidden="true" />
              </Reveal>
              <Reveal className="split__body" delay={120}>
                <SectionHeading
                  eyebrow="Our Story"
                  title={`Craftsmanship you can stand behind`}
                  description={about?.description}
                />
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <Button to="/projects" variant="primary" iconRight="arrow-right">
                    See Our Work
                  </Button>
                  <Button to="/quote" variant="secondary" icon="send">
                    Request a Quote
                  </Button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* Values (same editable source as the homepage "why us" section) */}
          {whyUs?.items?.length > 0 ? (
            <section className="section section--soft">
              <div className="container">
                <Reveal>
                  <SectionHeading
                    eyebrow="What Drives Us"
                    title={whyUs.heading || 'Our Values'}
                    description={whyUs.subheading}
                    center
                  />
                </Reveal>
                <div className="values-grid">
                  {whyUs.items.slice(0, 6).map((item, index) => (
                    <Reveal className="value-card" key={item.title} delay={index * 70}>
                      <span className="value-card__icon" aria-hidden="true">
                        <Icon name={VALUE_ICONS[index % VALUE_ICONS.length]} size={22} />
                      </span>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          ) : null}

          {/* Visit us */}
          <section className="section">
            <div className="container">
              <Reveal className="cta-band">
                <h2>Visit Our Workshop</h2>
                <p>
                  {settings.address
                    ? `We are located at ${settings.address}. Drop by to discuss your project or see our work up close.`
                    : 'Drop by to discuss your project or see our work up close.'}
                </p>
                <div className="cta-band__actions">
                  <Button to="/contact" variant="accent" iconRight="arrow-right">
                    Contact Us
                  </Button>
                  {settings.phone ? (
                    <Button href={telLink(settings.phone)} variant="ghost" icon="phone">
                      {settings.phone}
                    </Button>
                  ) : null}
                </div>
              </Reveal>
            </div>
          </section>
        </>
      )}
    </>
  );
}
