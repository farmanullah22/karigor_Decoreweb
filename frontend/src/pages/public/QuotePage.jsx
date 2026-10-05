import { useSearchParams } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import QuoteForm from '../../components/public/QuoteForm';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { telLink, whatsappLink } from '../../utils/format';

const NEXT_STEPS = [
  { icon: 'inbox', title: 'We review your request', text: 'Our team studies your requirements and photos.' },
  { icon: 'ruler', title: 'Site visit & measurement', text: 'We visit your site to take exact measurements (free of cost).' },
  { icon: 'file-text', title: 'Detailed quotation', text: 'You receive an itemised quote with material options.' },
  { icon: 'tool', title: 'Production & installation', text: 'We fabricate in our workshop and install with our own team.' },
];

/**
 * Request-a-Quote page. Product/service detail pages link here with
 * ?product= or ?service= to prefill the form.
 */
export default function QuotePage() {
  const { settings } = useSettings();
  const [searchParams] = useSearchParams();
  const companyName = settings.companyName || 'Decora';

  const productParam = searchParams.get('product') || '';
  const serviceParam = searchParams.get('service') || '';
  const typeParam = searchParams.get('type') || '';

  const defaultProductService = productParam || serviceParam || '';
  const source = productParam ? 'product' : serviceParam ? 'service' : 'quote_page';

  useDocumentMeta({
    title: `Request a Quote | ${companyName}`,
    description: `Tell ${companyName} about your window, glass, aluminum or interior project and receive a detailed quotation.`,
  });

  const waHref = whatsappLink(
    settings.whatsapp || settings.phone,
    `Hello ${companyName}, I would like a quotation for my project.`
  );

  return (
    <>
      <PageHeader
        eyebrow="Request a Quote"
        title="Get a Custom Quotation"
        description="Share your requirements and we will prepare a detailed, itemised quotation for you - usually within one business day."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Request a Quote' }]}
      />

      <section className="section">
        <div className="container quote-layout">
          <div className="contact-form-card">
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Project Details</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
              The more we know, the more accurate your quote will be.
            </p>
            <QuoteForm
              defaultProductService={defaultProductService}
              defaultProjectType={typeParam}
              source={source}
            />
          </div>

          <aside className="quote-aside">
            <h3>What Happens Next</h3>
            <ul className="quote-aside__list">
              {NEXT_STEPS.map((step) => (
                <li key={step.title}>
                  <Icon name={step.icon} size={18} />
                  <span>
                    <strong style={{ color: 'var(--color-ink)', display: 'block' }}>{step.title}</strong>
                    {step.text}
                  </span>
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 'var(--space-6)',
                paddingTop: 'var(--space-6)',
                borderTop: '1px solid var(--color-line)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                Prefer to talk? We are happy to help.
              </p>
              {waHref ? (
                <Button href={waHref} variant="whatsapp" icon="whatsapp" block>
                  WhatsApp Us
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
      </section>
    </>
  );
}
