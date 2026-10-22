import type { ReactNode } from "react";

export type TextBadgeVariant =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "error";

/**
 * Short label with text, such as "Nieuw" or "Concept". The text carries the
 * meaning; the colour only supports it.
 */
const TextBadge = ({
  variant = "neutral",
  children,
}: {
  variant?: TextBadgeVariant;
  children: ReactNode;
}) => (
  <span className={`rhc-mox-text-badge rhc-mox-text-badge--${variant}`}>
    {children}
  </span>
);

export default TextBadge;
