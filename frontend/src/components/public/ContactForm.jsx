import { useId, useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { inquiriesApi } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext';

const PHONE_REGEX = /^[+\d][\d\s\-()]{5,24}$/;
const EMPTY = { name: '', phone: '', email: '', service: '', message: '', website: '' };

/**
 * Public contact form -> POST /api/inquiries.
 * Includes a hidden honeypot field for basic spam protection and
 * client-side validation mirroring the server rules.
 */
export default function ContactForm({
  serviceOptions = [],
  defaultService = '',
  source = 'contact_form',
  onSuccess,
}) {
  const toast = useToast();
  const fieldId = useId();
  const [values, setValues] = useState({ ...EMPTY, service: defaultService });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!PHONE_REGEX.test(values.phone.trim())) next.phone = 'Please enter a valid phone number.';
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (values.message.trim().length < 5) next.message = 'Please write a short message.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await inquiriesApi.create({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        service: values.service.trim(),
        message: values.message.trim(),
        source,
        website: values.website,
      });
      setSent(true);
      setValues({ ...EMPTY, service: defaultService });
      toast.success('Thank you! Your message has been sent.');
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'We could not send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="alert alert--success" role="status">
        <Icon name="check-circle" size={20} />
        <div>
          <strong>Message sent successfully.</strong>
          <p style={{ marginTop: 4 }}>
            Thank you for reaching out - our team will get back to you within one business day.
          </p>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            style={{ marginTop: 10 }}
            onClick={() => setSent(false)}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-name`}>
          Full name <span className="required">*</span>
        </label>
        <input
          id={`${fieldId}-name`}
          className={`form-input${errors.name ? ' form-input--error' : ''}`}
          type="text"
          autoComplete="name"
          placeholder="Your name"
          value={values.name}
          onChange={setField('name')}
        />
        {errors.name ? <span className="form-error">{errors.name}</span> : null}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-phone`}>
          Phone <span className="required">*</span>
        </label>
        <input
          id={`${fieldId}-phone`}
          className={`form-input${errors.phone ? ' form-input--error' : ''}`}
          type="tel"
          autoComplete="tel"
          placeholder="+880 1XXX-XXXXXX"
          value={values.phone}
          onChange={setField('phone')}
        />
        {errors.phone ? <span className="form-error">{errors.phone}</span> : null}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-email`}>
          Email
        </label>
        <input
          id={`${fieldId}-email`}
          className={`form-input${errors.email ? ' form-input--error' : ''}`}
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={setField('email')}
        />
        {errors.email ? <span className="form-error">{errors.email}</span> : null}
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-service`}>
          Interested in
        </label>
        {serviceOptions.length > 0 ? (
          <select
            id={`${fieldId}-service`}
            className="form-select"
            value={values.service}
            onChange={setField('service')}
          >
            <option value="">Select a product / service (optional)</option>
            {serviceOptions.map((option) => (
              <option key={option.value || option} value={option.value || option}>
                {option.label || option}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={`${fieldId}-service`}
            className="form-input"
            type="text"
            placeholder="e.g. Aluminum windows"
            value={values.service}
            onChange={setField('service')}
          />
        )}
      </div>

      <div className="form-field form-field--full">
        <label className="form-label" htmlFor={`${fieldId}-message`}>
          Message <span className="required">*</span>
        </label>
        <textarea
          id={`${fieldId}-message`}
          className={`form-textarea${errors.message ? ' form-textarea--error' : ''}`}
          rows={5}
          placeholder="Tell us about your requirement…"
          value={values.message}
          onChange={setField('message')}
        />
        {errors.message ? <span className="form-error">{errors.message}</span> : null}
      </div>

      {/* Honeypot: hidden from humans, tempting for bots. */}
      <div className="form-honeypot" aria-hidden="true">
        <label htmlFor={`${fieldId}-website`}>Website</label>
        <input
          id={`${fieldId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={setField('website')}
        />
      </div>

      <div className="form-field form-field--full">
        <Button type="submit" variant="accent" icon="send" loading={submitting}>
          Send Message
        </Button>
      </div>
    </form>
  );
}
