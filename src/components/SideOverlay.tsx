"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Button,
  Drawer,
  Heading,
} from "@rijkshuisstijl-community/components-react";
import { usePathname } from "next/navigation";

const OPEN_EVENT = "prototype:open-side-overlay";

/** As long as the dialog transition in globals.css. */
const SLIDE_MS = 300;

/** Opens the panel with this id, just like the keyboard shortcut. */
export const openSideOverlay = (id: string) =>
  window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: id }));

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
  // Close when the page changes, for example via a link in the panel.
  const pathname = usePathname();
  const [shownOn, setShownOn] = useState(pathname);
  if (shownOn !== pathname) {
    setShownOn(pathname);
    if (open) setOpen(false);
  }
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingRef = useRef(false);

  /**
   * First close the dialog itself, so it slides out to the right; only then
   * remove it from the DOM. With "reduced motion" right away.
   */
  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    dialogRef.current?.close();
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setTimeout(
      () => {
        closingRef.current = false;
        setOpen(false);
        requestAnimationFrame(() => returnFocusRef.current?.focus());
      },
      reducedMotion ? 0 : SLIDE_MS,
    );
  }, []);
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
          close();
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

    const handleOpen = (event: Event) => {
      if (!(event instanceof CustomEvent) || event.detail !== id) return;
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      setOpen(true);
    };

    document.addEventListener("keydown", handleShortcut);
    window.addEventListener(OPEN_EVENT, handleOpen);
    return () => {
      document.removeEventListener("keydown", handleShortcut);
      window.removeEventListener(OPEN_EVENT, handleOpen);
    };
  }, [id, shortcut, close]);

  useEffect(() => {
    if (open) requestAnimationFrame(() => closeButtonRef.current?.focus());
  }, [open]);

  return (
    <>
      {open && (
        <Drawer
          ref={dialogRef}
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
