import Button from '../common/Button';
import Icon from '../common/Icon';

/**
 * Repeatable list of paired values (specifications label/value,
 * process steps title/description). Value shape: array of objects
 * with the keys declared in `fields`.
 */
export default function PairListInput({
  label,
  value = [],
  onChange,
  fields = [
    { key: 'label', placeholder: 'Label', width: 1 },
    { key: 'value', placeholder: 'Value', width: 2 },
  ],
  addLabel = 'Add row',
  hint,
}) {
  const updateAt = (index, key, text) => {
    onChange(value.map((item, i) => (i === index ? { ...item, [key]: text } : item)));
  };

  const removeAt = (index) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const empty = {};
    fields.forEach((field) => {
      empty[field.key] = '';
    });
    onChange([...value, empty]);
  };

  return (
    <div className="form-field form-field--full">
      <span className="form-label">{label}</span>
      {value.length > 0 && (
        <div className="repeat-list">
          {value.map((item, index) => (
            <div className="repeat-row" key={index}>
              {fields.map((field) => (
                <input
                  key={field.key}
                  className="form-input"
                  style={{ flex: field.width || 1 }}
                  type="text"
                  value={item[field.key] || ''}
                  placeholder={field.placeholder}
                  onChange={(event) => updateAt(index, field.key, event.target.value)}
                />
              ))}
              <button
                type="button"
                className="icon-btn icon-btn--danger"
                onClick={() => removeAt(index)}
                aria-label="Remove row"
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: value.length > 0 ? 'var(--space-3)' : 0 }}>
        <Button type="button" size="sm" variant="ghost" icon="plus" onClick={addRow}>
          {addLabel}
        </Button>
      </div>
      {hint ? <span className="form-hint">{hint}</span> : null}
    </div>
  );
}
