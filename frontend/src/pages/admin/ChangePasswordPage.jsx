import { useState } from 'react';

import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/endpoints';
import { setStoredToken } from '../../services/api';

const EMPTY_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

/**
 * Change the admin password. Requires the current password, enforces the
 * same policy as the server (8-72 characters, at least one letter and one
 * number) and refreshes the stored JWT afterwards.
 */
export default function ChangePasswordPage() {
  const { logout } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [visible, setVisible] = useState({ currentPassword: false, newPassword: false, confirmPassword: false });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useDocumentMeta({ title: 'Change Password | Admin' });

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleVisible = (key) =>
    setVisible((current) => ({ ...current, [key]: !current[key] }));

  const validate = () => {
    const errors = {};
    if (!form.currentPassword) {
      errors.currentPassword = 'Your current password is required.';
    }
    if (form.newPassword.length < 8 || form.newPassword.length > 72) {
      errors.newPassword = 'New password must be 8-72 characters.';
    } else if (!/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword)) {
      errors.newPassword = 'New password must contain at least one letter and one number.';
    } else if (form.newPassword === form.currentPassword) {
      errors.newPassword = 'The new password must be different from the current one.';
    }
    if (form.confirmPassword !== form.newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;
    setSuccess(false);
    if (!validate()) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const result = await authApi.changePassword(form.currentPassword, form.newPassword);
      // The server re-signs the JWT after a password change.
      if (result?.token) setStoredToken(result.token);
      toast.success('Password changed successfully.');
      setSuccess(true);
      setForm(EMPTY_FORM);
      setFieldErrors({});
    } catch (err) {
      toast.error(err?.message || 'Could not change your password.');
    } finally {
      setSaving(false);
    }
  };

  const passwordField = (key, label, placeholder, autoComplete) => (
    <div className="form-field">
      <label className="form-label" htmlFor={`password-${key}`}>
        {label} <span className="required">*</span>
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={`password-${key}`}
          className={`form-input${fieldErrors[key] ? ' form-input--error' : ''}`}
          type={visible[key] ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          style={{ paddingRight: 46 }}
          value={form[key]}
          disabled={saving}
          onChange={(event) => update(key, event.target.value)}
        />
        <button
          type="button"
          className="icon-btn"
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)' }}
          onClick={() => toggleVisible(key)}
          aria-label={visible[key] ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <Icon name={visible[key] ? 'eye-off' : 'eye'} size={18} />
        </button>
      </div>
      {fieldErrors[key] ? <span className="form-error">{fieldErrors[key]}</span> : null}
    </div>
  );

  return (
    <div style={{ maxWidth: 620 }}>
      {success ? (
        <div className="alert alert--success" style={{ marginBottom: 'var(--space-6)' }} role="status">
          <Icon name="check-circle" size={18} />
          <span>Your password has been changed. Use it the next time you sign in.</span>
        </div>
      ) : null}

      <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">
            <Icon name="key" size={18} />
            Update Password
          </h2>
          <div className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            {passwordField('currentPassword', 'Current password', 'Enter your current password', 'current-password')}
            {passwordField('newPassword', 'New password', 'At least 8 characters with a letter and a number', 'new-password')}
            {passwordField('confirmPassword', 'Confirm new password', 'Repeat the new password', 'new-password')}
          </div>
          <p className="form-hint" style={{ marginTop: 'var(--space-3)' }}>
            For security, signing in on other devices may require the new password.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-8)',
          }}
        >
          <Button type="button" variant="ghost" onClick={() => logout()} disabled={saving}>
            Sign out
          </Button>
          <Button type="submit" variant="accent" loading={saving} icon="check">
            Change Password
          </Button>
        </div>
      </form>
    </div>
  );
}
