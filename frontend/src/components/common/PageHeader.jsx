import { Link } from 'react-router-dom';

/**
 * Dark hero band used at the top of inner public pages,
 * with an optional breadcrumb trail for orientation and SEO.
 *
 * `breadcrumbs`: [{ label, to }] - the last item is rendered as plain text.
 */
export default function PageHeader({ eyebrow, title, description, breadcrumbs = [] }) {
  return (
    <header className="page-header">
      <div className="container">
        {breadcrumbs.length > 0 && (
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <span key={`${crumb.label}-${index}`} className="breadcrumbs__item">
                  {index > 0 ? <span className="breadcrumbs__sep" aria-hidden="true">/</span> : null}
                  {isLast || !crumb.to ? (
                    <span aria-current="page">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  )}
                </span>
              );
            })}
          </nav>
        )}
        {eyebrow ? <span className="page-header__eyebrow">{eyebrow}</span> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}
