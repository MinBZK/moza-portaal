"use client";

import { useState, type ComponentProps, type MouseEvent } from "react";
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
  onClose?: () => void;
};

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
  if (!closable || props.type === "error") {
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
      <div className="rhc-alert-closable-content">
        {children}
        <IconButton
          className="rhc-alert-close-button"
          icon="kruis"
          label={closeLabel}
          onClick={close}
        />
      </div>
    </RhcAlert>
  );
};
