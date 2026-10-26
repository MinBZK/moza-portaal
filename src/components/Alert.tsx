"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
} from "react";
import {
  Alert as RhcAlert,
  IconButton,
} from "@rijkshuisstijl-community/components-react/no-side-effects";

type RhcAlertProps = ComponentProps<typeof RhcAlert>;

type AlertProps = Omit<RhcAlertProps, "type"> & {
  type?: "info" | "ok" | "warning" | "error";
  /**
   * Show a close button. Ignored for errors: the user has to resolve the
   * problem first. So `closable` can stay on when the type varies.
   */
  closable?: boolean;
  closeLabel?: string;
  /** After the alert is closed, by the close button or by autoHide. */
  onClose?: () => void;
  /**
   * Fade out and disappear by itself, for a confirmation the user does not
   * need to go on, such as "Het bericht is gemarkeerd als ongelezen".
   * `true`: at least 3 seconds, longer for a longer text (reading time).
   * A number: that many milliseconds. Ignored for errors. Put the alert in a
   * role="status", and give it a new key to show it again.
   */
  autoHide?: boolean | number;
};

/** Shortest time an auto-hiding alert stays visible. */
const MIN_VISIBLE_MS = 3000;
/** Reading time per word (about 200 words a minute), and the maximum. */
const MS_PER_WORD = 300;
const MAX_VISIBLE_MS = 15000;
/** Fade-out, as .rhc-mox-fade-out in rhc.css. */
const FADE_MS = 500;

/** Time to read a text: 0.3 s a word, at least 3 s and at most 15 s. */
const readingTime = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.min(
    MAX_VISIBLE_MS,
    Math.max(MIN_VISIBLE_MS, words * MS_PER_WORD),
  );
};

/**
 * RHC Alert with an optional close button and an optional automatic
 * hide. After closing, focus moves to <main>, so it does not get lost on
 * <body>.
 */
export const Alert = ({
  closable = false,
  closeLabel = "Melding sluiten",
  onClose,
  autoHide = false,
  className,
  children,
  ...props
}: AlertProps) => {
  const [closed, setClosed] = useState(false);
  const [fading, setFading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // The latest onClose, without restarting the autoHide timer when it changes.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const hides = autoHide !== false && props.type !== "error";

  useEffect(() => {
    if (!hides) return;
    const visible =
      typeof autoHide === "number"
        ? autoHide
        : readingTime(wrapperRef.current?.textContent ?? "");
    const fade = setTimeout(() => setFading(true), visible);
    const gone = setTimeout(() => {
      setClosed(true);
      onCloseRef.current?.();
    }, visible + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, [hides, autoHide]);

  if (closed) return null;

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    const main = event.currentTarget.closest("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
    setClosed(true);
    onClose?.();
  };

  const alert =
    !closable || props.type === "error" ? (
      <RhcAlert className={className} {...props}>
        {children}
      </RhcAlert>
    ) : (
      <RhcAlert
        className={`rhc-mox-alert-closable${className ? ` ${className}` : ""}`}
        {...props}
      >
        <div className="rhc-mox-alert-closable-content">
          {children}
          <IconButton
            className="rhc-mox-alert-close-button"
            icon="kruis"
            label={closeLabel}
            onClick={close}
          />
        </div>
      </RhcAlert>
    );

  if (!hides) return alert;
  return (
    <div
      ref={wrapperRef}
      className={`rhc-mox-fade-out${fading ? " rhc-mox-fade-out--hidden" : ""}`}
    >
      {alert}
    </div>
  );
};
