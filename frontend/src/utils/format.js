/**
 * Small formatting helpers shared across the public site and dashboard.
 */

export function formatDate(value, options = {}) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
}

export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** "3 days ago" style relative time for dashboard lists. */
export function timeAgo(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export function truncate(text = '', length = 120) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trimEnd()}…`;
}

/** Digits-only phone for links (tel:, https://wa.me/). */
export function phoneDigits(phone = '') {
  return String(phone).replace(/[^\d]/g, '');
}

export function telLink(phone = '') {
  return `tel:${String(phone).replace(/[^\d+]/g, '')}`;
}

export function whatsappLink(whatsapp = '', message = '') {
  const digits = phoneDigits(whatsapp);
  if (!digits) return '';
  const text = message ? `?text=${encodeURIComponent(message)}` : '';
  return `https://wa.me/${digits}${text}`;
}

export function mailtoLink(email = '') {
  return `mailto:${email}`;
}

export function formatFileSize(bytes = 0) {
  if (!bytes) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PROJECT_TYPE_LABELS = {
  '': 'Not specified',
  residential: 'Residential',
  commercial: 'Commercial',
  office: 'Office',
  industrial: 'Industrial',
  other: 'Other',
};

export function projectTypeLabel(value) {
  return PROJECT_TYPE_LABELS[value] || value;
}
