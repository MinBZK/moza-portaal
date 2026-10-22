"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Alert } from "@/components/rhc";

/** How long the alert is visible, and how long it fades out (rhc.css). */
const VISIBLE_MS = 3000;
const FADE_MS = 500;

/**
 * An alert that fades out after 3 seconds and then disappears, for a small
 * confirmation. Pass a different key to show it again. Put it in a
 * role="status", so screen readers announce it right away.
 */
const TemporaryAlert = ({
  type = "ok",
  closable = false,
  children,
}: {
  type?: "info" | "ok" | "warning" | "error";
  /** Close button, as with Alert (ignored for errors). */
  closable?: boolean;
  children: ReactNode;
}) => {
  const [phase, setPhase] = useState<"visible" | "fading" | "gone">("visible");

  useEffect(() => {
    const fade = setTimeout(() => setPhase("fading"), VISIBLE_MS);
    const gone = setTimeout(() => setPhase("gone"), VISIBLE_MS + FADE_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;
  return (
    <div
      className={`rhc-fade-out${phase === "fading" ? " rhc-fade-out--hidden" : ""}`}
    >
      <Alert type={type} closable={closable}>
        {children}
      </Alert>
    </div>
  );
};

export default TemporaryAlert;
