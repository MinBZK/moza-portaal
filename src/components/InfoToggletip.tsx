"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton, Paragraph } from "@/components/rhc";
import { InfoSquareIcon } from "@/components/icons/infoSquareIcon";

/**
 * The RHC Toggletip (same markup and classes), with an accessible name of our
 * own. The RHC version always names its button "tooltip-content", which a
 * screen reader reads out in English and without a subject.
 *
 * The content opens as a layer over the page (rhc.css), so it also closes
 * with Escape and with a click or tap outside it.
 */
/** Close; back to the (i) button when the keyboard or the close button did it. */
const close = (details: HTMLDetailsElement, focusButton: boolean) => {
  details.open = false;
  if (focusButton) details.querySelector("summary")?.focus();
};

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

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close(details, true);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!details.contains(event.target as Node)) close(details, false);
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
        <InfoSquareIcon className="rhc-toggletip__icon" />
      </summary>
      <div className="rhc-toggletip__content">
        {/* The markup of the RHC Alert (info): its icon prop only takes an
            RHC icon id, and this one shows the same icon as the button.
            Without role="status": the user opens it, so a screen reader
            reads it after "expanded", as with any disclosure. */}
        <div className="utrecht-alert utrecht-alert--info rhc-alert rhc-mox-alert-closable rhc-toggletip__alert">
          <div className="utrecht-alert__icon">
            <InfoSquareIcon />
          </div>
          <div className="utrecht-alert__content">
            <div className="utrecht-alert__message">
              <div className="rhc-mox-alert-closable-content">
                {typeof children === "string" ? (
                  <Paragraph>{children}</Paragraph>
                ) : (
                  <div className="rhc-mox-stack rhc-mox-stack--md">
                    {children}
                  </div>
                )}
                <IconButton
                  className="rhc-mox-alert-close-button"
                  icon="kruis"
                  label="Toelichting sluiten"
                  onClick={() =>
                    detailsRef.current && close(detailsRef.current, true)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};

export default InfoToggletip;
