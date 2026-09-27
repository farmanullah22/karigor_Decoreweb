import Icon from './Icon';

/** Builds a compact page list: 1 … 4 5 6 … 20 */
function buildPages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push('start-ellipsis');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < total - 1) pages.push('end-ellipsis');
  pages.push(total);

  return pages;
}

/**
 * Server-side pagination control.
 * `meta` is the shape returned by the backend: { page, totalPages, hasPrevPage, hasNextPage }.
 */
export default function Pagination({ meta, onPageChange, disabled = false }) {
  if (!meta || !meta.totalPages || meta.totalPages <= 1) return null;

  const { page, totalPages, hasPrevPage, hasNextPage } = meta;
  const pages = buildPages(page, totalPages);

  const go = (next) => {
    if (disabled || next < 1 || next > totalPages || next === page) return;
    onPageChange(next);
  };

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => go(page - 1)}
        disabled={disabled || !hasPrevPage}
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={16} />
      </button>

      {pages.map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            className={`pagination__btn${item === page ? ' pagination__btn--active' : ''}`}
            onClick={() => go(item)}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="pagination__ellipsis" aria-hidden="true">
            …
          </span>
        )
      )}

      <button
        type="button"
        className="pagination__btn"
        onClick={() => go(page + 1)}
        disabled={disabled || !hasNextPage}
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </nav>
  );
}
