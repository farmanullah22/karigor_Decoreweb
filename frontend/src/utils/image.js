import { API_ORIGIN } from '../services/api';

/**
 * Resolves an image URL coming from the API into a usable src.
 * - Absolute URLs (http/https/data:) are returned unchanged.
 * - Uploaded files ("/uploads/...") are served by the backend: in
 *   production the backend origin is prepended; in development the Vite
 *   proxy handles it.
 * - Any other path ("/seed-images/...") refers to frontend public assets.
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  if (/^(https?:|data:|blob:)/i.test(url)) return url;
  if (url.startsWith('/uploads') && API_ORIGIN) return `${API_ORIGIN}${url}`;
  return url;
}

/** Generic inline placeholder used when a record has no image. */
export const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="#f1efe9"/>
      <g stroke="#c9c4b8" stroke-width="2" fill="none">
        <rect x="270" y="180" width="260" height="200" rx="6"/>
        <line x1="400" y1="180" x2="400" y2="380"/>
        <line x1="270" y1="280" x2="530" y2="280"/>
      </g>
      <text x="400" y="440" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" fill="#a39d8f">Karigor Decore</text>
    </svg>`
  );

/** Convenience: resolves and falls back to the placeholder. */
export function imageSrc(image) {
  const url = typeof image === 'string' ? image : image && image.url;
  return resolveImageUrl(url) || IMAGE_PLACEHOLDER;
}

/** Alt text with a sensible fallback (important for SEO + a11y). */
export function imageAlt(image, fallback = '') {
  if (image && typeof image === 'object' && image.alt) return image.alt;
  return fallback;
}
