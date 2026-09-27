import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';

/**
 * Admin login: split-screen layout with brand visual on the left and the
 * sign-in form on the right. Returns the user to the page they wanted
 * (RequireAuth passes it via location.state.from) after a successful login.
 */
export default function LoginPage() {
  const { login, isAuthenticated, initializing } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const companyName = settings.companyName || 'Karigor Decore';
  useDocumentMeta({ title: `Admin Login | ${companyName}` });

  // Where to go after a successful sign-in.
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname || '/admin'}${from.search || ''}` : '/admin';

  // Signed-in admins never see the login screen.
  if (!initializing && isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      await login(trimmedEmail, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login">
      {/* ---------------- Brand visual ---------------- */}
      <aside className="admin-login__visual">
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span className="brand__mark" aria-hidden="true">
            {companyName
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <span>
            <span style={{ display: 'block', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
              {companyName}
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.68rem',
                letterSpacing: 'var(--tracking-wide)',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)',
                marginTop: 2,
              }}
            >
              Admin Panel
            </span>
          </span>
        </div>

        <div className="admin-login__quote">
          <h2>Run the entire business from one dashboard.</h2>
          <p>
            Manage products, projects, inquiries and quote requests — everything your customers
            see on the website, in one place.
          </p>
        </div>

        <div style={{ position: 'relative', display: 'flex', gap: 24, color: 'rgba(255,255,255,0.4)', fontSize: 'var(--text-sm)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={16} />
            Secure access
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Icon name="dashboard" size={16} />
            Live data
          </span>
        </div>
      </aside>

      {/* ---------------- Sign-in form ---------------- */}
      <div className="admin-login__form-wrap">
        <div className="admin-login__form">
          <h1>Welcome back</h1>
          <p>Sign in to manage your website content and customer requests.</p>

          {error ? (
            <div className="alert alert--error" style={{ marginBottom: 'var(--space-5)' }} role="alert">
              <Icon name="alert-circle" size={18} />
              <span>{error}</span>
            </div>
          ) : null}

          <form className="form-grid" style={{ gridTemplateColumns: '1fr' }} onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label className="form-label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                className="form-input"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                disabled={submitting}
                onChange={(event) => setEmail(event.target.value)}
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Your password"
                  style={{ paddingRight: 46 }}
                  value={password}
                  disabled={submitting}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <Icon name={showPassword ? 'eye-off' : 'eye'} size={18} />
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              block
              loading={submitting}
              iconRight={submitting ? undefined : 'arrow-right'}
            >
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div style={{ marginTop: 'var(--space-6)', textAlign: 'center' }}>
            <Link
              to="/"
              className="panel__link"
              style={{ justifyContent: 'center', color: 'var(--color-muted)' }}
            >
              <Icon name="arrow-left" size={15} />
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
