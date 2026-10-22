/**
 * Progress bar. With a value it shows how far along something is; without a
 * value the duration is unknown and a piece of the bar moves back and forth
 * (as when loading). In an info alert the bar takes that alert's colour
 * (rhc.css).
 */
const ProgressBar = ({
  label,
  value,
  max = 100,
  valueText,
}: {
  /** Accessible name, for example "Berichten ophalen". */
  label: string;
  /** Current value; leave empty when the duration is unknown. */
  value?: number;
  max?: number;
  /** What a screen reader reads out, for example "3 van 14 organisaties". */
  valueText?: string;
}) => {
  const determinate = value !== undefined;
  const percent = determinate && max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={determinate ? 0 : undefined}
      aria-valuemax={determinate ? max : undefined}
      aria-valuenow={determinate ? value : undefined}
      aria-valuetext={determinate ? valueText : undefined}
      className={`rhc-progressbar${determinate ? "" : " rhc-progressbar--indeterminate"}`}
    >
      <div
        className="rhc-progressbar-track"
        style={determinate ? { inlineSize: `${percent}%` } : undefined}
      />
    </div>
  );
};

export default ProgressBar;
