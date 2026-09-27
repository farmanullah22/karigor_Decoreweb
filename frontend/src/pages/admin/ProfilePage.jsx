import { useEffect, useState } from 'react';

import ImagePicker from '../../components/admin/ImagePicker';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../context/AuthContext';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { useToast } from '../../context/ToastContext';
import { authApi } from '../../services/endpoints';
import { formatDateTime, getInitials } from '../../utils/format';
import { resolveImageUrl } from '../../utils/image';

/**
 * Admin profile: update name, email, phone and avatar. Changes are saved
 * to the database and reflected across the dashboard immediately.
 */
export default function ProfilePage() {
  const { admin, setAdmin } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useDocumentMeta({ title: 'Profile | Admin' });

  useEffect(() => {
    if (!admin) return;
    setForm({
      name: admin.name || '',
      email: admin.email || '',
      phone: admin.phone || '',
      avatar: admin.avatar || '',
    });
  }, [admin]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving) return;

    const name = form.name.trim();
    const email = form.email.trim();
    const errors = {};
    if (name.length < 2 || name.length > 80) errors.name = 'Name must be 2-80 characters.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name,
        email,
        phone: form.phone.trim(),
        avatar: form.avatar,
      });
      setAdmin(updated);
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err?.message || 'Could not update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard-grid--wide" style={{ display: 'grid', gap: 'var(--space-6)' }}>
      {/* -------- Summary card -------- */}
      <div className="panel">
        <div className="panel__body" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <span className="admin-avatar" style={{ width: 72, height: 72, fontSize: '1.5rem' }}>
            {admin?.avatar ? (
              <img src={resolveImageUrl(admin.avatar)} alt="" />
            ) : (
              getInitials(admin?.name || 'Admin')
            )}
          </span>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h2 style={{ fontSize: 'var(--text-xl)', color: 'var(--color-ink)' }}>
              {admin?.name || 'Administrator'}
            </h2>
            <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>{admin?.email}</p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span className="badge badge--accent" style={{ textTransform: 'capitalize' }}>
                {admin?.role || 'admin'}
              </span>
              {admin?.lastLoginAt ? (
                <span className="badge badge--neutral">
                  Last login: {formatDateTime(admin.lastLoginAt)}
                </span>
              ) : null}
            </div>
          </div>
          <Button to="/admin/change-password" variant="secondary" icon="key">
            Change Password
          </Button>
        </div>
      </div>

      {/* -------- Edit form -------- */}
      <form className="admin-form-card" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-section">
          <h2 className="admin-form-section__title">
            <Icon name="user" size={18} />
            Personal Details
          </h2>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label" htmlFor="profile-name">
                Full name <span className="required">*</span>
              </label>
              <input
                id="profile-name"
                className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
                type="text"
                maxLength={80}
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
              />
              {fieldErrors.name ? <span className="form-error">{fieldErrors.name}</span> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="profile-email">
                Email address <span className="required">*</span>
              </label>
              <input
                id="profile-email"
                className={`form-input${fieldErrors.email ? ' form-input--error' : ''}`}
                type="email"
                value={form.email}
                onChange={(event) => update('email', event.target.value)}
              />
              {fieldErrors.email ? <span className="form-error">{fieldErrors.email}</span> : null}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="profile-phone">
                Phone number
              </label>
              <input
                id="profile-phone"
                className="form-input"
                type="tel"
                maxLength={30}
                placeholder="+880 1XXX-XXXXXX"
                value={form.phone}
                onChange={(event) => update('phone', event.target.value)}
              />
            </div>

            <ImagePicker
              label="Avatar"
              value={form.avatar ? { url: form.avatar, alt: '' } : null}
              onChange={(image) => update('avatar', image?.url || '')}
              hint="A square photo works best. Shown in the sidebar."
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-8)',
          }}
        >
          <Button type="submit" variant="accent" loading={saving} icon="check">
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}
