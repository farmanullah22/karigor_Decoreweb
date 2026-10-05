import { Link } from 'react-router-dom';

import Icon from '../common/Icon';
import { useSettings } from '../../context/SettingsContext';
import { PUBLIC_NAV_LINKS } from '../../utils/constants';
import { mailtoLink, telLink, whatsappLink } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

const SOCIAL_ICONS = {
  facebook: 'facebook',
  instagram: 'instagram',
  tiktok: 'tiktok',
  youtube: 'youtube',
  linkedin: 'linkedin',
};

/**
 * Site footer - every piece of information (description, contact details,
 * social profiles) comes from company settings managed in the dashboard.
 */
export default function Footer() {
  const { settings } = useSettings();
  const name = settings.companyName || 'Decora';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const socialEntries = Object.entries(SOCIAL_ICONS).filter(
    ([key]) => settings.social && settings.social[key]
  );

  const waHref = whatsappLink(settings.whatsapp || settings.phone);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          {/* Brand + description + socials */}
          <div className="footer__brand">
            <Link to="/" className="brand" aria-label={`${name} - home`}>
              {settings.logo ? (
                <img src={resolveImageUrl(settings.logo)} alt="" className="brand__logo-img" />
              ) : (
                <span
                  className="brand__mark"
                  aria-hidden="true"
                  style={{ background: 'var(--color-accent)' }}
                >
                  {initials}
                </span>
              )}
              <span className="brand__name">{name}</span>
            </Link>
            <p>{settings.footerDescription || settings.tagline || ''}</p>
            {socialEntries.length > 0 && (
              <div className="footer__social">
                {socialEntries.map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} on ${key}`}
                  >
                    <Icon name={SOCIAL_ICONS[key]} size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Sitemap */}
          <div>
            <h3 className="footer__heading">Explore</h3>
            <nav className="footer__links" aria-label="Footer navigation">
              {PUBLIC_NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions */}
          <div>
            <h3 className="footer__heading">Get Started</h3>
            <nav className="footer__links">
              <Link to="/quote">Request a Quote</Link>
              {waHref ? (
                <a href={waHref} target="_blank" rel="noopener noreferrer">
                  WhatsApp Us
                </a>
              ) : null}
              {settings.email ? <a href={mailtoLink(settings.email)}>Email Us</a> : null}
              {settings.phone ? <a href={telLink(settings.phone)}>Call Us</a> : null}
            </nav>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="footer__heading">Contact</h3>
            <div className="footer__contact">
              {settings.address ? (
                <div className="footer__contact-item">
                  <Icon name="map-pin" size={17} />
                  <span>{settings.address}</span>
                </div>
              ) : null}
              {settings.phone ? (
                <div className="footer__contact-item">
                  <Icon name="phone" size={17} />
                  <a href={telLink(settings.phone)}>{settings.phone}</a>
                </div>
              ) : null}
              {settings.email ? (
                <div className="footer__contact-item">
                  <Icon name="mail" size={17} />
                  <a href={mailtoLink(settings.email)}>{settings.email}</a>
                </div>
              ) : null}
              {settings.businessHours && settings.businessHours.length > 0 ? (
                <div className="footer__contact-item">
                  <Icon name="clock" size={17} />
                  <span>
                    {settings.businessHours.map((entry) => (
                      <span key={`${entry.days}-${entry.hours}`} style={{ display: 'block' }}>
                        {entry.days}: {entry.hours}
                      </span>
                    ))}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>
            &copy; {new Date().getFullYear()} {name}. All rights reserved.
          </span>
          <div className="footer__bottom-links">
            <Link to="/products">Products</Link>
            <Link to="/services">Services</Link>
            <Link to="/projects">Projects</Link>
            <Link to="/admin/login">Staff Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
