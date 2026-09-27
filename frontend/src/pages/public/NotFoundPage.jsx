import { Link } from 'react-router-dom';

import Button from '../../components/common/Button';

/** 404 page with helpful links back into the site. */
export default function NotFoundPage() {
  return (
    <div className="container">
      <div className="not-found">
        <span className="not-found__code">404</span>
        <h1>Page not found</h1>
        <p style={{ color: 'var(--color-muted)', maxWidth: 460 }}>
          The page you are looking for does not exist or has been moved. Let us help you find
          your way back.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button to="/" variant="primary" icon="home">
            Back to Home
          </Button>
          <Button to="/products" variant="secondary" iconRight="arrow-right">
            Browse Products
          </Button>
        </div>
        <p style={{ fontSize: 'var(--text-sm)' }}>
          Or <Link to="/contact" className="link-arrow">contact us</Link> if you need anything.
        </p>
      </div>
    </div>
  );
}
