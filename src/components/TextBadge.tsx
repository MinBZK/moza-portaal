import type { ReactNode } from "react";
import Link from "next/link";
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
 * meaning; the icon and colour only support it. With `href` the badge is a
 * link, for example to the page where the user can act on the status.
 */
const TextBadge = ({
  variant = "neutral",
  icon = true,
  href,
  children,
}: {
  variant?: TextBadgeVariant;
  /** Show the icon of the variant. A neutral badge has no icon. */
  icon?: boolean;
  /** Makes the badge a link to this address. */
  href?: string;
  children: ReactNode;
}) => {
  const className = `rhc-mox-text-badge rhc-mox-text-badge--${variant}`;
  const content = (
    <>
      {icon && variant !== "neutral" && <Icon icon={ICONS[variant]} />}
      {children}
    </>
  );

  return href ? (
    <Link href={href} className={`${className} rhc-mox-text-badge--link`}>
      {content}
    </Link>
  ) : (
    <span className={className}>{content}</span>
  );
};

export default TextBadge;
