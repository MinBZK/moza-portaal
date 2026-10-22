import type { CSSProperties } from "react";

export type BarGraphItem = { label: string; value: number };

/**
 * Horizontal bar graph. Each bar has its label and value as text next to it,
 * so the numbers can be read without the bars; the bars themselves are only
 * visual. For a single value within a range, use rhc-mox-graph-meter.
 */
const BarGraph = ({
  title,
  items,
  max,
  formatValue = String,
}: {
  /** Caption of the graph. */
  title: string;
  items: BarGraphItem[];
  /** Value of a full bar; defaults to the largest value. */
  max?: number;
  /** How a value is shown, for example "€ 1.200" or "32%". */
  formatValue?: (value: number) => string;
}) => {
  const top = max ?? Math.max(0, ...items.map((item) => item.value));
  return (
    <figure className="rhc-mox-bar-graph">
      <figcaption className="rhc-mox-bar-graph__title">{title}</figcaption>
      <dl className="rhc-mox-bar-graph__list">
        {items.map(({ label, value }) => (
          <div key={label} className="rhc-mox-bar-graph__item">
            <dt className="rhc-mox-bar-graph__label">{label}</dt>
            <dd className="rhc-mox-bar-graph__value">
              <span
                className="rhc-mox-bar-graph__bar"
                aria-hidden="true"
                style={
                  {
                    "--rhc-bar-graph-fill": top > 0 ? value / top : 0,
                  } as CSSProperties
                }
              />
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
};

export default BarGraph;
