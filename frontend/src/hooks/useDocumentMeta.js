import { useEffect } from 'react';

/**
 * SEO hook: keeps the document title and key meta tags in sync with the
 * current page (titles, description, Open Graph). Runs client-side which
 * is sufficient for a SPA; the backend also exposes /sitemap.xml.
 */
export function useDocumentMeta({ title, description, image, type = 'website', url } = {}) {
  useEffect(() => {
    if (title) document.title = title;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:image', image);
    if (url) setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
  }, [title, description, image, type, url]);
}

function setMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}
