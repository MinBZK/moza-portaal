"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Button,
  Drawer,
  Heading,
} from "@rijkshuisstijl-community/components-react";

const SideOverlay = ({
  id,
  title,
  shortcut,
  children,
}: {
  id: string;
  title: string;
  shortcut: string;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const titleId = `${id}-title`;

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (
        !["f", "p"].includes(event.key.toLowerCase()) ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.repeat ||
        event.isComposing ||
        event.defaultPrevented
      ) {
        return;
      }

      const activeDialog = document.querySelector("dialog[open]");
      if (activeDialog) {
        if (
          document.getElementById(id)?.closest("dialog[open]") === activeDialog
        ) {
          event.preventDefault();
          setOpen(false);
          requestAnimationFrame(() => returnFocusRef.current?.focus());
        }
        return;
      }

      if (event.key.toLowerCase() !== shortcut) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest(
            "input, textarea, select, [contenteditable='true'], [role='textbox']",
          ))
      ) {
        return;
      }

      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpen(true);
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [id, shortcut]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [open]);

  const close = () => {
    setOpen(false);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  };

  return (
    <>
      {open && (
        <Drawer
          align="inline-end"
          className="prototype-side-overlay"
          modal
          open
          aria-labelledby={titleId}
          aria-keyshortcuts="f p"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div id={id}>
            <div className="prototype-side-overlay__header">
              <Heading level={2} id={titleId}>
                {title}
              </Heading>
              <Button
                ref={closeButtonRef}
                appearance="secondary-action-button"
                onClick={close}
              >
                Sluiten
              </Button>
            </div>
            <div className="prototype-side-overlay__content">{children}</div>
          </div>
        </Drawer>
      )}
    </>
  );
};

export default SideOverlay;
