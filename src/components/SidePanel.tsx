"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Button, Drawer, Heading } from "@/components/rhc";

/** As long as the dialog transition in globals.css. */
const SLIDE_MS = 300;

/**
 * A panel that slides in from the right, with a title and a close button.
 * Focus moves to the close button and returns to the element that opened it.
 */
const SidePanel = ({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  // Stays true while the panel slides out, so the dialog can animate.
  const [shown, setShown] = useState(open);
  if (open && !shown) setShown(true);

  useEffect(() => {
    if (open) {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      requestAnimationFrame(() => closeButtonRef.current?.focus());
      return;
    }
    if (!shown) return;
    dialogRef.current?.close();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timer = setTimeout(
      () => {
        setShown(false);
        returnFocusRef.current?.focus();
      },
      reducedMotion ? 0 : SLIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [open, shown]);

  if (!shown) return null;
  return (
    <Drawer
      ref={dialogRef}
      align="inline-end"
      className="rhc-mox-side-panel"
      modal
      open
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="rhc-mox-side-panel__header">
        <Heading level={2} id={titleId}>
          {title}
        </Heading>
        <Button
          ref={closeButtonRef}
          appearance="secondary-action-button"
          onClick={onClose}
        >
          Sluiten
        </Button>
      </div>
      <div className="rhc-mox-side-panel__content">{children}</div>
    </Drawer>
  );
};

export default SidePanel;
