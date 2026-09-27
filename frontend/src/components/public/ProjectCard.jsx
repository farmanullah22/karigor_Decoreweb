import { Link } from 'react-router-dom';

import Icon from '../common/Icon';
import LazyImage from '../common/LazyImage';
import { formatDate, truncate } from '../../utils/format';

/** Portfolio project card with cover image, category and completion date. */
export default function ProjectCard({ project }) {
  const href = `/projects/${project.slug}`;

  return (
    <article className="project-card">
      <Link to={href} className="project-card__media" aria-label={project.name}>
        <LazyImage image={project.coverImage} alt={project.name} />
      </Link>
      <div className="project-card__body">
        {project.category ? (
          <span className="project-card__category">{project.category}</span>
        ) : null}
        <h3 className="project-card__title">
          <Link to={href}>{project.name}</Link>
        </h3>
        <p className="card__text">
          {truncate(project.shortDescription || project.description || '', 110)}
        </p>
        <div className="project-card__meta">
          {project.location ? (
            <span>
              <Icon name="map-pin" size={15} /> {project.location}
            </span>
          ) : null}
          {project.completionDate ? (
            <span>
              <Icon name="clock" size={15} /> {formatDate(project.completionDate, { month: 'long' })}
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
