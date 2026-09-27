import { useEffect } from 'react';

import Icon from './Icon';

/**
 * Accessible modal dialog:
 * - closes on Escape and on overlay click
 * - locks body scroll while open
 */
export default function Modal({ open, title, subtitle, onClose, children, footer, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div
        className={`modal${wide ? ' modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : 'Dialog'}
      >
        {(title || onClose) && (
          <div className="modal__header">
            <div>
              {title ? <h3 className="modal__title">{title}</h3> : null}
              {subtitle ? <p className="modal__subtitle">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              className="modal__close icon-btn"
              onClick={() => onClose?.()}
              aria-label="Close dialog"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        )}
        <div className="modal__body">{children}</div>
        {footer ? <div className="modal__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
