import Icon from './Icon';

/**
 * Shared loading / error / empty state primitives used by every page
 * so data states look consistent across the app.
 */

export function LoadingBlock({ label = 'Loading…', minHeight = '40vh' }) {
  return (
    <div className="loading-block" style={{ minHeight }}>
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We could not load this content. Please try again.',
  onRetry,
  minHeight = '30vh',
}) {
  return (
    <div className="empty-state" style={{ minHeight }}>
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name="alert-circle" size={26} />
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry ? (
        <button type="button" className="btn btn--secondary btn--sm" onClick={onRetry}>
          <Icon name="refresh" size={16} />
          <span>Try again</span>
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({ icon = 'inbox', title = 'Nothing here yet', message, action }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <h3>{title}</h3>
      {message ? <p>{message}</p> : null}
      {action || null}
    </div>
  );
}

/** Placeholder cards shown while a grid of records loads. */
export function SkeletonCards({ count = 6, className = 'grid grid--3' }) {
  return (
    <div className={className} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton skeleton-card__media" />
          <div className="skeleton-card__body">
            <div className="skeleton skeleton-line skeleton-line--title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line--short" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Simple pulsing table rows for admin lists. */
export function SkeletonRows({ count = 5, columns = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, rowIndex) => (
        <tr key={rowIndex} aria-hidden="true">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <td key={colIndex}>
              <div className="skeleton skeleton-line" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
