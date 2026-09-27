/**
 * Section heading used on the public site and in admin pages.
 * `center` optically centers the block; `action` renders on the right.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
  action,
  as: Tag = 'h2',
  className = '',
}) {
  return (
    <div className={`section-heading${center ? ' section-heading--center' : ''}${className ? ` ${className}` : ''}`}>
      <div className="section-heading__text">
        {eyebrow ? <span className="section-heading__eyebrow">{eyebrow}</span> : null}
        {title ? <Tag>{title}</Tag> : null}
        {description ? <p className="section-heading__description">{description}</p> : null}
      </div>
      {action ? <div className="section-heading__action">{action}</div> : null}
    </div>
  );
}
