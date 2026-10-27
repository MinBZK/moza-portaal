import type { ReactNode } from "react";
import { Icon } from "@/components/rhc";

export type TextBadgeVariant = "neutral" | "info" | "ok" | "warning" | "error";

/** Same icons as the RHC Alert, so a badge and an alert of a type match. */
const ICONS = {
  info: "info-circle",
  ok: "circle-check",
  warning: "let-op",
  error: "alert-circle",
} as const;

/**
 * Short label with text, such as "Nieuw" or "Concept". The text carries the
 * meaning; the icon and colour only support it.
 */
const TextBadge = ({
  variant = "neutral",
  children,
}: {
  variant?: TextBadgeVariant;
  children: ReactNode;
}) => (
  <span className={`rhc-mox-text-badge rhc-mox-text-badge--${variant}`}>
    {variant !== "neutral" && <Icon icon={ICONS[variant]} />}
    {children}
  </span>
);

export default TextBadge;
