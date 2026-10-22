"use client";

import { useId, useState } from "react";

/**
 * Two-way switch for a setting that takes effect right away, such as
 * "E-mailmeldingen". A button with role="switch": Space and Enter toggle it.
 * Besides the position of the knob, the text "Aan" or "Uit" shows the state.
 * For a choice that is only saved with a form, use a checkbox instead.
 */
const Switch = ({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
  onText = "Aan",
  offText = "Uit",
}: {
  label: string;
  /** With checked and onChange the parent keeps track of the state. */
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  onText?: string;
  offText?: string;
}) => {
  const labelId = useId();
  const [ownChecked, setOwnChecked] = useState(defaultChecked);
  const on = checked ?? ownChecked;

  const toggle = () => {
    if (checked === undefined) setOwnChecked(!on);
    onChange?.(!on);
  };

  return (
    <div className="rhc-mox-switch">
      <span id={labelId} className="rhc-mox-switch__label">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={toggle}
        className="rhc-mox-switch__button"
      >
        <span className="rhc-mox-switch__track" aria-hidden="true">
          <span className="rhc-mox-switch__thumb" />
        </span>
        <span className="rhc-mox-switch__state" aria-hidden="true">
          {on ? onText : offText}
        </span>
      </button>
    </div>
  );
};

export default Switch;
