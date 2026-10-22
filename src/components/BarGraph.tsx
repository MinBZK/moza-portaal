import type { CSSProperties } from "react";

export type BarGraphVariant = "neutral" | "positive" | "negative";

export type BarGraphItem = {
  label: string;
  value: number;
  /** Overrides the variant of the graph for this bar. */
  variant?: BarGraphVariant;
};

/**
 * Horizontal bar graph. Each bar has its label and value as text next to it,
 * so the numbers can be read without the bars; the bars themselves are only
 * visual. For a single value within a range, use rhc-mox-graph-meter.
 *
 * Variants: neutral (blue), positive (green) and negative (red). The colour
 * only supports the meaning: say in the title or the label what is good or
 * bad, for example "Besparing" or "Boven de norm".
 */
const Bar = ({ fill }: { fill: number }) => (
  <span
    className="rhc-mox-bar-graph__bar"
    aria-hidden="true"
    style={{ "--rhc-bar-graph-fill": fill } as CSSProperties}
  />
);

const BarGraph = ({
  title,
  items,
  max,
  formatValue = String,
  variant = "neutral",
  track = false,
}: {
  /** Caption of the graph. */
  title: string;
  items: BarGraphItem[];
  /** Value of a full bar; defaults to the largest value. */
  max?: number;
  /** How a value is shown, for example "€ 1.200" or "32%". */
  formatValue?: (value: number) => string;
  variant?: BarGraphVariant;
  /**
   * Show every bar on a grey track as wide as the longest bar, so the bars
   * are easy to compare with the maximum.
   */
  track?: boolean;
}) => {
  const top = max ?? Math.max(0, ...items.map((item) => item.value));
  return (
    <figure className="rhc-mox-bar-graph">
      <figcaption className="rhc-mox-bar-graph__title">{title}</figcaption>
      <dl className="rhc-mox-bar-graph__list">
        {items.map(({ label, value, variant: itemVariant }) => (
          <div
            key={label}
            className={`rhc-mox-bar-graph__item rhc-mox-bar-graph__item--${itemVariant ?? variant}`}
          >
            <dt className="rhc-mox-bar-graph__label">{label}</dt>
            <dd className="rhc-mox-bar-graph__value">
              {track ? (
                <span className="rhc-mox-bar-graph__track" aria-hidden="true">
                  <Bar fill={top > 0 ? value / top : 0} />
                </span>
              ) : (
                <Bar fill={top > 0 ? value / top : 0} />
              )}
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </figure>
  );
};

export default BarGraph;
