import Button from '../../components/common/Button';
import Reveal from '../../components/common/Reveal';
import PageHeader from '../../components/common/PageHeader';
import { EmptyState, ErrorState, SkeletonCards } from '../../components/common/States';
import ServiceCard from '../../components/public/ServiceCard';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { servicesApi } from '../../services/endpoints';

/** Services overview - custom fabrication, installation and decoration work. */
export default function ServicesPage() {
  const { settings } = useSettings();
  const { data, loading, error, reload } = useApi(() => servicesApi.list({ limit: 48 }), []);

  const services = data?.items || [];

  useDocumentMeta({
    title: `Services | ${settings.companyName || 'Karigor Decore'}`,
    description:
      'Custom aluminum fabrication, glass installation, windows, doors, partitions and interior decoration services.',
  });

  return (
    <>
      <PageHeader
        eyebrow="What We Do"
        title="Our Services"
        description="From a single custom window to a complete commercial glazing package - we design, fabricate and install. Bring us your project and we will build a solution around it."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Services' }]}
      />

      <section className="section">
        <div className="container">
          {loading ? (
            <SkeletonCards count={6} />
          ) : error ? (
            <ErrorState onRetry={() => reload()} />
          ) : services.length === 0 ? (
            <EmptyState
              icon="tool"
              title="Services coming soon"
              message="Our services are being updated. Please check back shortly."
            />
          ) : (
            <div className="grid grid--3">
              {services.map((service, index) => (
                <Reveal key={service._id} delay={(index % 3) * 80}>
                  <ServiceCard service={service} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Custom solution CTA - products and bespoke work have equal weight */}
      <section className="section section--soft">
        <div className="container">
          <Reveal className="cta-band">
            <h2>Need Something Custom?</h2>
            <p>
              We regularly take on bespoke fabrication projects - unusual shapes, special
              materials, complex installations. Tell us what you have in mind.
            </p>
            <div className="cta-band__actions">
              <Button to="/quote" variant="accent" size="lg" icon="send">
                Request a Custom Quote
              </Button>
              <Button to="/products" variant="ghost" size="lg" iconRight="arrow-right">
                Browse Products Instead
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
