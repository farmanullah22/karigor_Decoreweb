import Icon from '../common/Icon';

/** Dashboard metric card: label, big value, optional sub text and icon. */
export default function StatCard({ icon = 'dashboard', label, value, sub }) {
  return (
    <div className="stat-card">
      <div>
        <div className="stat-card__label">{label}</div>
        <div className="stat-card__value">{value}</div>
        {sub ? <div className="stat-card__sub">{sub}</div> : null}
      </div>
      <span className="stat-card__icon" aria-hidden="true">
        <Icon name={icon} size={20} />
      </span>
    </div>
  );
}
