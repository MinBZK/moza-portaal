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
  /** Zichtbare naam van de schuifregelaar. */
  label: string;
  min: number;
  max: number;
  /** Met value en onChange houdt de ouder de waarde bij. */
  value?: number;
  defaultValue?: number;
  onChange?: (waarde: number, event: ChangeEvent<HTMLInputElement>) => void;
  /** Hoe de waarde wordt getoond, bijvoorbeeld "32 uur". */
  formatWaarde?: (waarde: number) => string;
  /** Kleur de baan van het begin tot aan de knop. */
  gevuld?: boolean;
};

/**
 * Schuifregelaar met label, de gekozen waarde en de grenzen eronder, in de
 * opmaak van de form fields van RHC.
 */
const RangeSlider = ({
  label,
  id,
  min,
  max,
  value,
  defaultValue,
  onChange,
  formatWaarde = String,
  gevuld = false,
  className,
  style,
  ...props
}: RangeSliderProps) => {
  const eigenId = useId();
  const veldId = id ?? eigenId;
  const [eigenWaarde, setEigenWaarde] = useState(defaultValue ?? min);
  const waarde = value ?? eigenWaarde;
  // Hoe ver de knop staat, van 0 tot 1; de CSS kleurt de baan tot daar.
  const deel = max > min ? (waarde - min) / (max - min) : 0;

  return (
    <div className="utrecht-form-field utrecht-form-field--text rhc-form-field rhc-range-slider">
      <div className="utrecht-form-field__label rhc-range-slider__header">
        <label htmlFor={veldId} className="utrecht-form-label">
          {label}
        </label>
        <output htmlFor={veldId} className="rhc-range-slider__value">
          {formatWaarde(waarde)}
        </output>
      </div>
      <div className="utrecht-form-field__input">
        <input
          id={veldId}
          type="range"
          min={min}
          max={max}
          value={waarde}
          // Schermlezers lezen de getoonde waarde voor, niet alleen het getal.
          aria-valuetext={formatWaarde(waarde)}
          onChange={(event) => {
            const nieuw = Number(event.target.value);
            if (value === undefined) setEigenWaarde(nieuw);
            onChange?.(nieuw, event);
          }}
          className={[
            "rhc-range-slider__input",
            gevuld && "rhc-range-slider__input--filled",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            gevuld
              ? ({
                  ...style,
                  "--rhc-range-slider-fill": deel,
                } as CSSProperties)
              : style
          }
          {...props}
        />
        <div className="rhc-range-slider__limits" aria-hidden="true">
          <span>{formatWaarde(min)}</span>
          <span>{formatWaarde(max)}</span>
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
