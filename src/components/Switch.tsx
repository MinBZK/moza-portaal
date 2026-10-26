"use client";

import { useId, useState } from "react";

/**
 * Two-way switch for a setting that takes effect right away, such as
 * "E-mailmeldingen". A button with role="switch": Space and Enter toggle it.
 * Besides the position of the knob, the text "Aan" or "Uit" shows the state.
 * For a choice that is only saved with a form, use a checkbox instead.
 *
 * With `twoWay` it switches between two options, such as "VLAM" and
 * "Claude": offText stands left of the knob and onText right, the chosen one
 * in bold. The accessible name is the label plus onText ("LLM Claude"), so
 * "on" means that option is chosen.
 */
const Switch = ({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  onText = "Aan",
  offText = "Uit",
  twoWay = false,
}: {
  label: string;
  /** With checked and onChange the parent keeps track of the state. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  onText?: string;
  offText?: string;
  twoWay?: boolean;
}) => {
  const labelId = useId();
  const buttonId = useId();
  const onTextId = useId();
  const [ownChecked, setOwnChecked] = useState(defaultChecked);
  const on = checked ?? ownChecked;

  const toggle = () => {
    if (checked === undefined) setOwnChecked(!on);
    onChange?.(!on);
  };

  return (
    <div className="rhc-mox-switch">
      {/* A real label: clicking it toggles the switch too. */}
      <label
        id={labelId}
        htmlFor={buttonId}
        className="utrecht-form-label rhc-mox-switch__label"
      >
        {label}
      </label>
      <button
        id={buttonId}
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={twoWay ? `${labelId} ${onTextId}` : labelId}
        disabled={disabled}
        onClick={toggle}
        className={`rhc-mox-switch__button${twoWay ? " rhc-mox-switch__button--two-way" : ""}`}
      >
        {twoWay && (
          <span
            className={`rhc-mox-switch__option${on ? "" : " rhc-mox-switch__option--chosen"}`}
            aria-hidden="true"
          >
            {offText}
          </span>
        )}
        <span className="rhc-mox-switch__track" aria-hidden="true">
          <span className="rhc-mox-switch__thumb" />
        </span>
        {twoWay ? (
          <span
            id={onTextId}
            className={`rhc-mox-switch__option${on ? " rhc-mox-switch__option--chosen" : ""}`}
            aria-hidden="true"
          >
            {onText}
          </span>
        ) : (
          <span className="rhc-mox-switch__state" aria-hidden="true">
            {on ? onText : offText}
          </span>
        )}
      </button>
    </div>
  );
};

export default Switch;
