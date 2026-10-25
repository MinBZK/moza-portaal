"use client";

import {
  useId,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
} from "react";

type RangeSliderProps = Omit<
  ComponentProps<"input">,
  "type" | "min" | "max" | "value" | "defaultValue" | "onChange"
> & {
  /** Visible name of the slider. */
  label: string;
  min: number;
  max: number;
  /** With value and onChange the parent keeps track of the value. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** How the value is shown, for example "32 uur". */
  formatValue?: (value: number) => string;
  /** Colour the track from the start up to the thumb. */
  filled?: boolean;
};

/**
 * Slider with a label, the chosen value and the limits below it, styled like
 * the RHC form fields.
 */
const RangeSlider = ({
  label,
  id,
  min,
  max,
  value,
  defaultValue,
  onChange,
  formatValue = String,
  filled = false,
  className,
  style,
  ...props
}: RangeSliderProps) => {
  const ownId = useId();
  const fieldId = id ?? ownId;
  const [ownValue, setOwnValue] = useState(defaultValue ?? min);
  const current = value ?? ownValue;
  // How far along the thumb is, from 0 to 1; the CSS colours the track up to there.
  const fraction = max > min ? (current - min) / (max - min) : 0;

  return (
    <div className="utrecht-form-field utrecht-form-field--text rhc-form-field rhc-mox-range-slider">
      <div className="utrecht-form-field__label rhc-mox-range-slider__header">
        <label htmlFor={fieldId} className="utrecht-form-label">
          {label}
        </label>
        <output htmlFor={fieldId} className="rhc-mox-range-slider__value">
          {formatValue(current)}
        </output>
      </div>
      <div className="utrecht-form-field__input">
        <input
          id={fieldId}
          type="range"
          min={min}
          max={max}
          value={current}
          // Screen readers read out the shown value, not just the number.
          aria-valuetext={formatValue(current)}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (value === undefined) setOwnValue(next);
            onChange?.(next, event);
          }}
          className={[
            "rhc-mox-range-slider__input",
            filled && "rhc-mox-range-slider__input--filled",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            filled
              ? ({
                  ...style,
                  "--rhc-range-slider-fill": fraction,
                } as CSSProperties)
              : style
          }
          {...props}
        />
        <div className="rhc-mox-range-slider__limits" aria-hidden="true">
          <span>{formatValue(min)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
