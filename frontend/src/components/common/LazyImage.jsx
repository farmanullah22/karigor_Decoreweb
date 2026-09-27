import { useState } from 'react';

import { IMAGE_PLACEHOLDER, imageAlt, imageSrc } from '../../utils/image';

/**
 * Image with lazy loading and a graceful fallback to the placeholder
 * when the file is missing or fails to load (SEO-friendly alt included).
 */
export default function LazyImage({ image, alt, className = '', fallbackAlt = '', ...rest }) {
  const [failed, setFailed] = useState(false);

  return (
    <img
      src={failed ? IMAGE_PLACEHOLDER : imageSrc(image)}
      alt={imageAlt(image, alt || fallbackAlt)}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
