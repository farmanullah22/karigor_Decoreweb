import { Link } from 'react-router-dom';

import Icon from '../common/Icon';
import LazyImage from '../common/LazyImage';
import { truncate } from '../../utils/format';

/** Product summary card used in listings, featured strips and related items. */
export default function ProductCard({ product }) {
  const href = `/products/${product.slug}`;
  const categoryName = product.category?.name;

  return (
    <article className="card">
      <Link to={href} className="card__media" aria-label={product.name}>
        <LazyImage image={product.image} alt={product.name} />
        {product.featured ? <span className="card__tag badge badge--accent">Featured</span> : null}
      </Link>
      <div className="card__body">
        {categoryName ? <span className="card__meta">{categoryName}</span> : null}
        <h3 className="card__title">
          <Link to={href}>{product.name}</Link>
        </h3>
        <p className="card__text">
          {truncate(product.shortDescription || product.description || '', 110)}
        </p>
        <div className="card__footer">
          <Link to={href} className="link-arrow">
            View details
            <Icon name="arrow-right" size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
