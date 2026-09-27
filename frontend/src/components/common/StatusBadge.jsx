/**
 * Renders a status pill from one of the shared status maps in utils/constants.
 *
 * Usage: <StatusBadge map={INQUIRY_STATUSES} value={inquiry.status} />
 */
export default function StatusBadge({ map = {}, value }) {
  const meta = map[value] || { label: value || 'Unknown', tone: 'neutral' };

  return (
    <span className={`badge badge--${meta.tone}`}>
      <span className="badge__dot" aria-hidden="true" />
      {meta.label}
    </span>
  );
}
