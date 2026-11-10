"use client";

import {
  useEffect,
  useSyncExternalStore,
  useId,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";
import FieldLabel from "./FieldLabel";
import ChangedValue from "./ChangedValue";

// Whether the user is dragging any slider, for values elsewhere that follow it.
let anyDragging = false;
const draggingListeners = new Set<() => void>();
const setAnyDragging = (value: boolean) => {
  anyDragging = value;
  draggingListeners.forEach((listener) => listener());
};

/** True while the user drags the thumb of a slider on the page. */
export const useSliderDragging = () =>
  useSyncExternalStore(
    (listener) => {
      draggingListeners.add(listener);
      return () => draggingListeners.delete(listener);
    },
    () => anyDragging,
    () => false,
  );

type RangeSliderProps = Omit<
  ComponentProps<"input">,
  "type" | "min" | "max" | "value" | "defaultValue" | "onChange"
> & {
  /** Visible name of the slider. */
  label: string;
  /** Next to the label, for example an InfoToggletip. */
  info?: ReactNode;
  /** A hint below the label, like the description of an RHC form field. */
  description?: string;
  min: number;
  max: number;
  /** With value and onChange the parent keeps track of the value. */
  value?: number;
  defaultValue?: number;
  onChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** How the value is shown, for example "32 uur". */
  formatValue?: (value: number) => string;
  /**
   * What a screen reader reads out for a value, when that needs more than
   * the shown text, for example "100 procent: geen verminderde loonwaarde".
   * Defaults to formatValue.
   */
  formatValueText?: (value: number) => string;
  /** Colour the track from the start up to the thumb. */
  filled?: boolean;
};

/**
 * Slider with a label, the chosen value and the limits below it, styled like
 * the RHC form fields.
 */
const RangeSlider = ({
  label,
  info,
  description,
  id,
  min,
  max,
  value,
  defaultValue,
  onChange,
  formatValue = String,
  formatValueText = formatValue,
  filled = false,
  className,
  style,
  onPointerDown,
  ...props
}: RangeSliderProps) => {
  const ownId = useId();
  const fieldId = id ?? ownId;
  const [ownValue, setOwnValue] = useState(defaultValue ?? min);
  const current = value ?? ownValue;
  // How far along the thumb is, from 0 to 1; the CSS colours the track up to there.
  const fraction = max > min ? (current - min) / (max - min) : 0;
  // While the user drags the thumb, the value stays emphasized.
  const [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!dragging) return;
    setAnyDragging(true);
    const stop = () => {
      setDragging(false);
      setAnyDragging(false);
    };
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [dragging]);

  return (
    <div className="utrecht-form-field utrecht-form-field--text rhc-form-field rhc-mox-range-slider">
      <div className="utrecht-form-field__label rhc-mox-range-slider__header">
        <FieldLabel htmlFor={fieldId} info={info}>
          {label}
        </FieldLabel>
        <output
          htmlFor={fieldId}
          className={`rhc-mox-range-slider__value${dragging ? " rhc-mox-range-slider__value--dragging" : ""}`}
        >
          <ChangedValue quiet={dragging}>{formatValue(current)}</ChangedValue>
        </output>
      </div>
      {description && (
        <div
          id={`${fieldId}-description`}
          className="utrecht-form-field__description utrecht-form-field-description"
        >
          {description}
        </div>
      )}
      <div className="utrecht-form-field__input">
        <input
          id={fieldId}
          aria-describedby={description ? `${fieldId}-description` : undefined}
          type="range"
          min={min}
          max={max}
          value={current}
          // Screen readers read out the shown value, not just the number.
          aria-valuetext={formatValueText(current)}
          onPointerDown={(event) => {
            setDragging(true);
            onPointerDown?.(event);
          }}
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
                  "--rhc-mox-range-slider-fill": fraction,
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
