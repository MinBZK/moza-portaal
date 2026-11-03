"use client";

import { useId, useRef, type ComponentProps, type ReactNode } from "react";
import { Button, VisuallyHidden } from "@/components/rhc";
import FieldLabel from "./FieldLabel";

/**
 * Invoerveld voor een getal met een label, in de opmaak van de form fields
 * van RHC (zoals FormFieldTextInput). Met knoppen ervoor en erna om het getal
 * met één stap (`step`) te verlagen of te verhogen.
 */
const NumberInput = ({
  label,
  info,
  id,
  className,
  ...props
}: Omit<ComponentProps<"input">, "type"> & {
  /** Zichtbare naam van het veld. */
  label: string;
  /** Naast het label, bijvoorbeeld een InfoToggletip. */
  info?: ReactNode;
}) => {
  const eigenId = useId();
  const veldId = id ?? eigenId;
  const veldRef = useRef<HTMLInputElement>(null);

  /**
   * stepUp en stepDown houden zich aan min, max en step. Het input-event
   * erna laat React het zien als een wijziging, zodat onChange afgaat.
   */
  const stap = (richting: 1 | -1) => {
    const veld = veldRef.current;
    if (!veld) return;
    if (richting === 1) veld.stepUp();
    else veld.stepDown();
    veld.dispatchEvent(new Event("input", { bubbles: true }));
  };

  return (
    <div className="utrecht-form-field utrecht-form-field--text rhc-form-field">
      <div className="utrecht-form-field__label">
        <FieldLabel htmlFor={veldId} info={info}>
          {label}
        </FieldLabel>
      </div>
      <div className="utrecht-form-field__input rhc-number-input">
        <Button
          type="button"
          appearance="secondary-action-button"
          aria-controls={veldId}
          onClick={() => stap(-1)}
        >
          <span aria-hidden="true">−</span>
          <VisuallyHidden>{label} verlagen</VisuallyHidden>
        </Button>
        <input
          ref={veldRef}
          id={veldId}
          type="number"
          // Op een telefoon een toetsenbord met cijfers, ook met decimalen.
          inputMode="decimal"
          className={`utrecht-textbox utrecht-textbox--html-input${className ? ` ${className}` : ""}`}
          {...props}
        />
        <Button
          type="button"
          appearance="secondary-action-button"
          aria-controls={veldId}
          onClick={() => stap(1)}
        >
          <span aria-hidden="true">+</span>
          <VisuallyHidden>{label} verhogen</VisuallyHidden>
        </Button>
      </div>
    </div>
  );
};

export default NumberInput;
