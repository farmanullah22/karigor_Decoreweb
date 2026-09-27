/**
 * Dependency-free bar chart for the dashboard: inquiries vs quote requests
 * over the last six months (data computed by the backend from live records).
 */
export default function BarChart({ data = [] }) {
  const max = Math.max(1, ...data.map((item) => Math.max(item.inquiries || 0, item.quotes || 0)));

  return (
    <div>
      <div className="bar-chart" role="img" aria-label="Inquiries and quote requests per month">
        {data.map((item) => (
          <div className="bar-chart__group" key={`${item.label}-${item.year}`}>
            <div className="bar-chart__bars">
              <div
                className="bar-chart__bar bar-chart__bar--inquiries"
                style={{ height: `${((item.inquiries || 0) / max) * 100}%` }}
                title={`${item.inquiries || 0} inquiries`}
              />
              <div
                className="bar-chart__bar bar-chart__bar--quotes"
                style={{ height: `${((item.quotes || 0) / max) * 100}%` }}
                title={`${item.quotes || 0} quote requests`}
              />
            </div>
            <span className="bar-chart__label">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="bar-chart__legend" style={{ marginTop: 'var(--space-4)' }}>
        <span>
          <span className="legend-dot" style={{ background: 'var(--color-accent)' }} />
          Inquiries
        </span>
        <span>
          <span className="legend-dot" style={{ background: 'var(--color-ink)' }} />
          Quote Requests
        </span>
      </div>
    </div>
  );
}
