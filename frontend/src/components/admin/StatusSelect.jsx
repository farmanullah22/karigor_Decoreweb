/**
 * Inline status dropdown used in list tables.
 * `map` is one of the status maps from utils/constants.
 */
export default function StatusSelect({ map = {}, value, onChange, disabled = false }) {
  return (
    <select
      className="status-select"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-label="Change status"
    >
      {Object.entries(map).map(([key, meta]) => (
        <option key={key} value={key}>
          {meta.label}
        </option>
      ))}
    </select>
  );
}
