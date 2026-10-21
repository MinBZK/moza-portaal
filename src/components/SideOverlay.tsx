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

const OPEN_EVENT = "prototype:open-side-overlay";

/** Even lang als de transition van dialog in globals.css. */
const SCHUIF_MS = 300;

/** Opent het paneel met dit id, net als de sneltoets. */
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
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const sluitendRef = useRef(false);

  /**
   * Eerst de dialog zelf sluiten, zodat hij naar rechts wegschuift; daarna
   * pas uit de DOM. Bij "minder beweging" meteen.
   */
  const close = useCallback(() => {
    if (sluitendRef.current) return;
    sluitendRef.current = true;
    dialogRef.current?.close();
    const rustig = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setTimeout(
      () => {
        sluitendRef.current = false;
        setOpen(false);
        requestAnimationFrame(() => returnFocusRef.current?.focus());
      },
      rustig ? 0 : SCHUIF_MS,
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
