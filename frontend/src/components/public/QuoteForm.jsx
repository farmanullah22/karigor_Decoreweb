import { useId, useState } from 'react';
import { Link } from 'react-router-dom';

import Button from '../common/Button';
import Icon from '../common/Icon';
import { quotesApi } from '../../services/endpoints';
import { useToast } from '../../context/ToastContext';
import { PROJECT_TYPE_OPTIONS } from '../../utils/constants';
import { formatFileSize } from '../../utils/format';

const PHONE_REGEX = /^[+\d][\d\s\-()]{5,24}$/;
const MAX_FILES = 5;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
const EMPTY = {
  name: '',
  phone: '',
  email: '',
  productService: '',
  quantity: '',
  projectType: '',
  budget: '',
  message: '',
  website: '',
};

/**
 * Request-a-Quote form -> POST /api/quotes.
 * Optional photo attachments are uploaded first (POST /api/quotes/attachments)
 * and referenced by URL in the request payload.
 */
export default function QuoteForm({
  defaultProductService = '',
  defaultProjectType = '',
  source = 'quote_page',
  onSuccess,
}) {
  const toast = useToast();
  const fieldId = useId();
  const [values, setValues] = useState({
    ...EMPTY,
    productService: defaultProductService,
    projectType: defaultProjectType,
  });
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const setField = (field) => (event) => {
    const { value } = event.target;
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList || []);
    const accepted = [];

    incoming.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`"${file.name}" was skipped - only image files are supported.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`"${file.name}" is larger than ${formatFileSize(MAX_FILE_SIZE)}.`);
        return;
      }
      accepted.push(file);
    });

    setFiles((current) => {
      const merged = [...current, ...accepted].slice(0, MAX_FILES);
      if (current.length + accepted.length > MAX_FILES) {
        toast.info(`You can attach up to ${MAX_FILES} photos.`);
      }
      return merged;
    });
  };

  const removeFile = (index) => {
    setFiles((current) => current.filter((_, i) => i !== index));
  };

  const validate = () => {
    const next = {};
    if (values.name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!PHONE_REGEX.test(values.phone.trim())) next.phone = 'Please enter a valid phone number.';
    if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = 'Please enter a valid email address.';
    }
    if (values.message.trim().length < 5) {
      next.message = 'Please describe your requirement (a few words at least).';
    }
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      let attachments = [];
      if (files.length > 0) {
        attachments = await quotesApi.uploadAttachments(files);
      }

      await quotesApi.create({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
        productService: values.productService.trim(),
        quantity: values.quantity.trim(),
        projectType: values.projectType,
        budget: values.budget.trim(),
        message: values.message.trim(),
        attachments,
        source,
        website: values.website,
      });

      setSent(true);
      setFiles([]);
      setValues({ ...EMPTY, productService: defaultProductService, projectType: defaultProjectType });
      toast.success('Your quote request has been submitted.');
      onSuccess?.();
    } catch (error) {
      toast.error(error.message || 'We could not submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="alert alert--success" role="status">
        <Icon name="check-circle" size={20} />
        <div>
          <strong>Quote request received.</strong>
          <p style={{ marginTop: 4 }}>
            Thank you! Our team will review your requirements and contact you within one business
            day with a detailed quotation.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setSent(false)}
            >
              Send another request
            </button>
            <Link className="btn btn--secondary btn--sm" to="/projects">
              <span>Browse our projects</span>
              <Icon name="arrow-right" size={16} />
            </Link>
          </div>
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
          placeholder="+92 3XX XXXXXXX"
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
        <label className="form-label" htmlFor={`${fieldId}-product`}>
          Product / service of interest
        </label>
        <input
          id={`${fieldId}-product`}
          className="form-input"
          type="text"
          placeholder="e.g. Sliding aluminum windows"
          value={values.productService}
          onChange={setField('productService')}
        />
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-type`}>
          Project type
        </label>
        <select
          id={`${fieldId}-type`}
          className="form-select"
          value={values.projectType}
          onChange={setField('projectType')}
        >
          <option value="">Select project type (optional)</option>
          {PROJECT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-field">
        <label className="form-label" htmlFor={`${fieldId}-quantity`}>
          Approx. quantity / size
        </label>
        <input
          id={`${fieldId}-quantity`}
          className="form-input"
          type="text"
          placeholder="e.g. 6 windows, 1200×1400 mm"
          value={values.quantity}
          onChange={setField('quantity')}
        />
      </div>

      <div className="form-field form-field--full">
        <label className="form-label" htmlFor={`${fieldId}-budget`}>
          Estimated budget
        </label>
        <input
          id={`${fieldId}-budget`}
          className="form-input"
          type="text"
          placeholder="e.g. PKR 150,000 (optional)"
          value={values.budget}
          onChange={setField('budget')}
        />
      </div>

      <div className="form-field form-field--full">
        <label className="form-label" htmlFor={`${fieldId}-message`}>
          Describe your requirement <span className="required">*</span>
        </label>
        <textarea
          id={`${fieldId}-message`}
          className={`form-textarea${errors.message ? ' form-textarea--error' : ''}`}
          rows={6}
          placeholder="Tell us about the space, materials you prefer, timeline…"
          value={values.message}
          onChange={setField('message')}
        />
        {errors.message ? <span className="form-error">{errors.message}</span> : null}
      </div>

      <div className="form-field form-field--full">
        <span className="form-label">Reference photos (optional)</span>
        <label className="file-drop" htmlFor={`${fieldId}-files`}>
          <Icon name="upload" size={20} />
          <div style={{ marginTop: 8 }}>
            Click to attach photos of your space or a reference design
          </div>
          <div className="form-hint">
            Up to {MAX_FILES} images, max {formatFileSize(MAX_FILE_SIZE)} each
          </div>
          <input
            id={`${fieldId}-files`}
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
          />
        </label>
        {files.length > 0 && (
          <div className="file-list">
            {files.map((file, index) => (
              <span className="file-chip" key={`${file.name}-${index}`}>
                <Icon name="image" size={13} />
                {file.name} ({formatFileSize(file.size)})
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <Icon name="close" size={13} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Honeypot */}
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
          Submit Quote Request
        </Button>
      </div>
    </form>
  );
}
