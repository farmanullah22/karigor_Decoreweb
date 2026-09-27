import { useState } from 'react';

import Button from '../common/Button';
import Icon from '../common/Icon';
import MediaPickerModal from './MediaPickerModal';
import { imageSrc } from '../../utils/image';

/**
 * Single-image field for admin forms: preview, media-library picker,
 * alt text input and a remove action. Value shape: `{ url, alt }` or null.
 */
export default function ImagePicker({ label = 'Image', value, onChange, hint }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasImage = Boolean(value && value.url);

  return (
    <div className="form-field form-field--full">
      <span className="form-label">{label}</span>
      <div className="image-picker">
        <div className="image-picker__preview">
          {hasImage ? (
            <img src={imageSrc(value)} alt={value.alt || ''} />
          ) : (
            <Icon name="image" size={26} />
          )}
        </div>
        <div className="image-picker__controls">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" icon="image" onClick={() => setPickerOpen(true)}>
              {hasImage ? 'Replace image' : 'Choose image'}
            </Button>
            {hasImage ? (
              <Button size="sm" variant="ghost" icon="trash" onClick={() => onChange(null)}>
                Remove
              </Button>
            ) : null}
          </div>
          <input
            className="form-input"
            type="text"
            placeholder="Alt text (describe the image for SEO)"
            value={value?.alt || ''}
            disabled={!hasImage}
            onChange={(event) =>
              onChange({ url: value?.url || '', alt: event.target.value })
            }
          />
          {hint ? <span className="form-hint">{hint}</span> : null}
        </div>
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(images) => onChange(images[0])}
      />
    </div>
  );
}
