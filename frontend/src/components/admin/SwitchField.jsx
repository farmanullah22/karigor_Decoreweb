/** Toggle switch styled form control (featured, active, public flags…). */
export default function SwitchField({ label, checked, onChange, disabled = false }) {
  return (
    <label className="switch">
      <input
        type="checkbox"
        checked={Boolean(checked)}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="switch__track" aria-hidden="true" />
      <span className="switch__label">{label}</span>
    </label>
  );
}
