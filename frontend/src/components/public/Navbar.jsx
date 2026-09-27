import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { useSettings } from '../../context/SettingsContext';
import { PUBLIC_NAV_LINKS } from '../../utils/constants';
import { telLink } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

/** Brand lockup: settings logo if configured, otherwise a monogram mark. */
export function Brand({ settings }) {
  const name = settings.companyName || 'Karigor Decore';
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link to="/" className="brand" aria-label={`${name} - home`}>
      {settings.logo ? (
        <img src={resolveImageUrl(settings.logo)} alt="" className="brand__logo-img" />
      ) : (
        <span className="brand__mark" aria-hidden="true">
          {initials}
        </span>
      )}
      <span>
        <span className="brand__name">{name}</span>
        {settings.tagline ? <span className="brand__tagline">{settings.tagline}</span> : null}
      </span>
    </Link>
  );
}

/**
 * Public site navigation: fixed translucent bar, scroll shadow,
 * active link highlighting, and a slide-in drawer on mobile.
 */
export default function Navbar() {
  const { settings } = useSettings();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}>
        <div className="container navbar__inner">
          <Brand settings={settings} />

          <nav className="navbar__links" aria-label="Main navigation">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `navbar__link${isActive ? ' navbar__link--active' : ''}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="navbar__actions">
            {settings.phone ? (
              <a
                className="btn btn--ghost btn--sm"
                href={telLink(settings.phone)}
                aria-label={`Call ${settings.phone}`}
              >
                <Icon name="phone" size={16} />
                <span>{settings.phone}</span>
              </a>
            ) : null}
            <Button to="/quote" variant="accent" size="sm" className="btn--quote" icon="send">
              Request a Quote
            </Button>
            <button
              type="button"
              className="navbar__burger"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
            >
              <Icon name="menu" size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`drawer${open ? ' drawer--open' : ''}`} aria-hidden={!open}>
        <div
          className="drawer__backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        />
        <aside className="drawer__panel" aria-label="Mobile navigation">
          <div className="drawer__header">
            <Brand settings={settings} />
            <button
              type="button"
              className="icon-btn"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          <nav className="drawer__links">
            {PUBLIC_NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) => `drawer__link${isActive ? ' drawer__link--active' : ''}`}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="drawer__footer">
            <Button to="/quote" variant="accent" icon="send" block>
              Request a Quote
            </Button>
            {settings.phone ? (
              <Button href={telLink(settings.phone)} variant="secondary" icon="phone" block>
                {settings.phone}
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </>
  );
}
