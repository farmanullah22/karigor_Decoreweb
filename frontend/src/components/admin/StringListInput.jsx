import Button from '../common/Button';
import Icon from '../common/Icon';

/**
 * Repeatable list of plain text values (features, materials, colors…).
 * Value shape: array of strings.
 */
export default function StringListInput({
  label,
  value = [],
  onChange,
  placeholder = '',
  addLabel = 'Add item',
  hint,
}) {
  const updateAt = (index, text) => {
    onChange(value.map((item, i) => (i === index ? text : item)));
  };

  const removeAt = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="form-field form-field--full">
      <span className="form-label">{label}</span>
      {value.length > 0 && (
        <div className="repeat-list">
          {value.map((item, index) => (
            <div className="repeat-row" key={index}>
              <input
                className="form-input"
                type="text"
                value={item}
                placeholder={placeholder}
                onChange={(event) => updateAt(index, event.target.value)}
              />
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => removeAt(index)}
                aria-label="Remove item"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: value.length > 0 ? 'var(--space-3)' : 0 }}>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          icon="plus"
          onClick={() => onChange([...value, ''])}
        >
          {addLabel}
        </Button>
      </div>
      {hint ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}
