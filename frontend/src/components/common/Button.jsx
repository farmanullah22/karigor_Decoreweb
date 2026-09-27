import { Link } from 'react-router-dom';

import Icon from './Icon';

/**
 * Single button primitive used across the whole app.
 *
 * - Renders a <Link> when `to` is given, an <a> when `href` is given,
 *   otherwise a <button>.
 * - `variant`: primary | accent | secondary | ghost | light | whatsapp | danger
 * - `size`: '' | sm | lg
 */
export default function Button({
  to,
  href,
  type = 'button',
  variant = 'primary',
  size = '',
  icon,
  iconRight,
  loading = false,
  block = false,
  disabled = false,
  className = '',
  children,
  ...rest
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size ? `btn--${size}` : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {loading ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        icon && <Icon name={icon} size={size === 'sm' ? 16 : 18} />
      )}
      {children ? <span>{children}</span> : null}
      {iconRight && !loading ? <Icon name={iconRight} size={size === 'sm' ? 16 : 18} /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {content}
    </button>
  );
}
