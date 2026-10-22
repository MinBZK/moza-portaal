"use client";

import { useState, type ComponentProps, type MouseEvent } from "react";
import {
  Alert as RhcAlert,
  IconButton,
} from "@rijkshuisstijl-community/components-react/no-side-effects";

type RhcAlertProps = ComponentProps<typeof RhcAlert>;

/**
 * An error alert cannot be closed: the user has to resolve the problem
 * first. All other types can, with `closable`.
 */
type AlertProps = Omit<RhcAlertProps, "type"> &
  (
    | {
        type: "error";
        closable?: never;
        closeLabel?: never;
        onClose?: never;
      }
    | {
        type?: "info" | "ok" | "warning";
        closable?: boolean;
        closeLabel?: string;
        onClose?: () => void;
      }
  );

/**
 * RHC Alert with an optional close button. After closing, focus moves to
 * <main>, so it does not get lost on <body>.
 */
export const Alert = ({
  closable = false,
  closeLabel = "Melding sluiten",
  onClose,
  className,
  children,
  ...props
}: AlertProps) => {
  const [closed, setClosed] = useState(false);

  if (closed) return null;
  if (!closable) {
    return (
      <RhcAlert className={className} {...props}>
        {children}
      </RhcAlert>
    );
  }

  const close = (event: MouseEvent<HTMLButtonElement>) => {
    const main = event.currentTarget.closest("main");
    if (main) {
      if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
    setClosed(true);
    onClose?.();
  };

  return (
    <RhcAlert
      className={`rhc-alert-closable${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
      <IconButton
        className="rhc-alert-close-button"
        icon="kruis"
        label={closeLabel}
        onClick={close}
      />
    </RhcAlert>
  );
};
