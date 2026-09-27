import { Link } from 'react-router-dom';

import Icon from '../common/Icon';
import { truncate } from '../../utils/format';
import ServiceIcon from './ServiceIcon';

/** Service summary card used on the home page and services listing. */
export default function ServiceCard({ service }) {
  const href = `/services/${service.slug}`;

  return (
    <article className="service-card">
      <span className="service-card__icon" aria-hidden="true">
        <ServiceIcon icon={service.icon} />
      </span>
      <h3 className="service-card__title">
        <Link to={href}>{service.name}</Link>
      </h3>
      <p className="service-card__text">
        {truncate(service.shortDescription || service.description || '', 140)}
      </p>
      <Link to={href} className="link-arrow">
        Learn more
        <Icon name="arrow-right" size={16} />
      </Link>
    </article>
  );
}
