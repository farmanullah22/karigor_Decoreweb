import Icon from '../../components/common/Icon';
import PageHeader from '../../components/common/PageHeader';
import ContactForm from '../../components/public/ContactForm';
import { useApi } from '../../hooks/useApi';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useSettings } from '../../context/SettingsContext';
import { servicesApi } from '../../services/endpoints';
import { mailtoLink, telLink, whatsappLink } from '../../utils/format';

/**
 * Contact page: company details (from settings) + the inquiry form that
 * writes into the dashboard's Inquiries section.
 */
export default function ContactPage() {
  const { settings } = useSettings();
  const { data: servicesData } = useApi(() => servicesApi.list({ limit: 50 }), []);

  const companyName = settings.companyName || 'Karigor Decore';
  const serviceOptions = (servicesData?.items || []).map((service) => ({
    value: service.name,
    label: service.name,
  }));

  useDocumentMeta({
    title: `Contact Us | ${companyName}`,
    description: `Get in touch with ${companyName}${
      settings.address ? ` - ${settings.address}` : ''
    }. Call, WhatsApp or send us a message about your project.`,
  });

  const waHref = whatsappLink(
    settings.whatsapp || settings.phone,
    `Hello ${companyName}, I have a question about your products and services.`
  );

  // Prefer a real embed URL; otherwise build an embed from the address.
  const mapEmbedSrc = settings.googleMapsUrl?.includes('embed')
    ? settings.googleMapsUrl
    : settings.address
      ? `https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`
      : settings.googleMapsUrl || '';

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Let's Talk About Your Project"
        description="Tell us what you need - windows, doors, glass, partitions or a full interior fit-out. Our team responds within one business day."
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
      />

      <section className="section">
        <div className="container contact-layout">
          {/* Company details */}
          <div className="contact-info">
            {settings.phone ? (
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <Icon name="phone" size={20} />
                </span>
                <div>
                  <div className="contact-info__label">Phone</div>
                  <div className="contact-info__value">
                    <a href={telLink(settings.phone)}>{settings.phone}</a>
                  </div>
                </div>
              </div>
            ) : null}

            {waHref ? (
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <Icon name="whatsapp" size={20} />
                </span>
                <div>
                  <div className="contact-info__label">WhatsApp</div>
                  <div className="contact-info__value">
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      Chat with us on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {settings.email ? (
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <Icon name="mail" size={20} />
                </span>
                <div>
                  <div className="contact-info__label">Email</div>
                  <div className="contact-info__value">
                    <a href={mailtoLink(settings.email)}>{settings.email}</a>
                  </div>
                </div>
              </div>
            ) : null}

            {settings.address ? (
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <Icon name="map-pin" size={20} />
                </span>
                <div>
                  <div className="contact-info__label">Address</div>
                  <div className="contact-info__value">{settings.address}</div>
                </div>
              </div>
            ) : null}

            {settings.businessHours?.length > 0 ? (
              <div className="contact-info__item">
                <span className="contact-info__icon" aria-hidden="true">
                  <Icon name="clock" size={20} />
                </span>
                <div>
                  <div className="contact-info__label">Business Hours</div>
                  <div className="contact-info__value">
                    {settings.businessHours.map((entry) => (
                      <span key={`${entry.days}-${entry.hours}`} style={{ display: 'block' }}>
                        {entry.days}: {entry.hours}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Inquiry form */}
          <div className="contact-form-card">
            <h2 style={{ marginBottom: 'var(--space-2)' }}>Send Us a Message</h2>
            <p style={{ color: 'var(--color-muted)', marginBottom: 'var(--space-6)' }}>
              Fill in the form and we will get back to you shortly.
            </p>
            <ContactForm serviceOptions={serviceOptions} source="contact_form" />
          </div>
        </div>

        {mapEmbedSrc ? (
          <div className="container">
            <div className="map-embed">
              <iframe
                title={`${companyName} location on Google Maps`}
                src={mapEmbedSrc}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        ) : null}
      </section>
    </>
  );
}
