import { useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import MediaPickerModal from './MediaPickerModal';
import { imageSrc } from '../../utils/image';

/**
 * Multi-image gallery field for admin forms. Value shape: array of
 * `{ url, alt }` objects. Duplicate URLs are ignored when merging.
 */
export default function GalleryPicker({ label = 'Gallery', value = [], onChange, hint }) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const removeAt = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const merge = (images) => {
    const merged = [...value];
    images.forEach((image) => {
      if (!merged.some((existing) => existing.url === image.url)) merged.push(image);
    });
    onChange(merged);
  };

  return (
    <div className="form-field form-field--full">
      <span className="form-label">{label}</span>
      <div style={{ marginBottom: 'var(--space-3)' }}>
        <Button size="sm" variant="secondary" icon="image" onClick={() => setPickerOpen(true)}>
          Add images
        </Button>
      </div>

      {value.length > 0 ? (
        <div className="gallery-picker">
          {value.map((image, index) => (
            <div className="gallery-picker__item" key={`${image.url}-${index}`}>
              <img src={imageSrc(image)} alt={image.alt || ''} loading="lazy" />
              <button
                type="button"
                className="gallery-picker__remove"
                onClick={() => removeAt(index)}
                aria-label="Remove image"
              >
                <Icon name="close" size={12} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <span className="form-hint">{hint || 'No gallery images selected yet.'}</span>
      )}

      <MediaPickerModal
        open={pickerOpen}
        multiple
        onClose={() => setPickerOpen(false)}
        onSelect={merge}
      />
    </div>
  );
}
