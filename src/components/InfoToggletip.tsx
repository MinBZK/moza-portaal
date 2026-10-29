"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Alert, Icon, Paragraph } from "@/components/rhc";

/**
 * The RHC Toggletip (same markup and classes), with an accessible name of our
 * own. The RHC version always names its button "tooltip-content", which a
 * screen reader reads out in English and without a subject.
 *
 * The content opens as a layer over the page (rhc.css), so it also closes
 * with Escape and with a click or tap outside it.
 */
const InfoToggletip = ({
  label,
  children,
}: {
  /** Accessible name of the (i) button, such as "Toelichting bij loonkostensubsidie". */
  label: string;
  /** Text, or several blocks such as paragraphs. */
  children: ReactNode;
}) => {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const details = detailsRef.current;
    if (!details) return;

    const close = (focusButton: boolean) => {
      details.open = false;
      if (focusButton) details.querySelector("summary")?.focus();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(true);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!details.contains(event.target as Node)) close(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <details
      ref={detailsRef}
      className="rhc-toggletip"
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary
        aria-label={label}
        className="rhc-toggletip__summary rhc-toggletip__button"
      >
        <Icon icon="info-circle" className="rhc-toggletip__icon" />
      </summary>
      <div className="rhc-toggletip__content">
        <Alert type="info" className="rhc-toggletip__alert">
          {typeof children === "string" ? (
            <Paragraph>{children}</Paragraph>
          ) : (
            <div className="rhc-mox-stack rhc-mox-stack--sm">{children}</div>
          )}
        </Alert>
      </div>
    </details>
  );
};

export default InfoToggletip;
