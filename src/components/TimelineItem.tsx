import type { ReactNode } from "react";
import { Icon, Paragraph } from "@/components/rhc";
import { CalendarIcon } from "@/components/icons/calendarIcon";
import { ExclamationIcon } from "@/components/icons/exclamationIcon";
import { InfoIcon } from "@/components/icons/infoIcon";

export type TimelineStatus = "info" | "ok" | "warning" | "error" | "neutral";

/**
 * Feedback icons without a circle or triangle, since the marker is already
 * a circle. Warning and error differ in colour, as do info and neutral.
 */
const ICON: Record<TimelineStatus, ReactNode> = {
  info: <InfoIcon />,
  ok: <Icon icon="vinkje" />,
  warning: <ExclamationIcon />,
  error: <ExclamationIcon />,
  neutral: <InfoIcon />,
};

/**
 * One event on a timeline (`<ol className="rhc-mox-timeline">`), with the
 * same structure as a step of the StatusTrack: a marker and a disclosure.
 * The colour and the icon repeat what the text says; they are hidden from
 * screen readers.
 */
const TimelineItem = ({
  title,
  date,
  status = "info",
  open = false,
  replaced = false,
  children,
}: {
  title: ReactNode;
  /** Date, shown with a calendar icon; preferably a <time>. */
  date?: ReactNode;
  status?: TimelineStatus;
  /** Expanded by default. */
  open?: boolean;
  /** Replaced by a later correction: the title is struck through. */
  replaced?: boolean;
  children?: ReactNode;
}) => (
  <li
    className={`rhc-mox-timeline__item rhc-mox-timeline__item--${status}${replaced ? " rhc-mox-timeline__item--replaced" : ""}`}
  >
    <span className="rhc-mox-timeline__marker" aria-hidden="true">
      {ICON[status]}
    </span>
    <details open={open}>
      <summary>
        {title}
        <Icon icon="chevron-right" />
      </summary>
      <div className="rhc-mox-status-details">
        {date && (
          <Paragraph className="rhc-mox-status-date">
            <CalendarIcon />
            {date}
          </Paragraph>
        )}
        {children}
      </div>
    </details>
  </li>
);

export default TimelineItem;
