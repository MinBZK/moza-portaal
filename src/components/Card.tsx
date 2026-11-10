"use client";

import { useId, useState, type ReactNode } from "react";
import { Button, Heading } from "@/components/rhc";
import { ChevronDownIcon } from "@/components/icons/chevronDownIcon";

type HeadingLevel = 1 | 2 | 3 | 4 | 5;

/**
 * A rhc-mox-card with a heading. With `collapsible` the heading is a button
 * that shows or hides the content (the disclosure pattern); the heading and
 * `action` stay visible in both states.
 */
const Card = ({
  heading,
  headingLevel = 2,
  collapsible = false,
  defaultOpen = true,
  action,
  className,
  children,
}: {
  heading: ReactNode;
  headingLevel?: HeadingLevel;
  /** The heading shows and hides the content. */
  collapsible?: boolean;
  /** Open at first; only with `collapsible`. */
  defaultOpen?: boolean;
  /** Always at the bottom, open or collapsed, such as an ActionGroup. */
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) => {
  const id = useId();
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;
  const [open, setOpen] = useState(defaultOpen);
  const expanded = !collapsible || open;

  return (
    <section
      className={[
        "rhc-mox-card",
        collapsible && "rhc-mox-card--collapsible",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={headingId}
    >
      {collapsible ? (
        // The markup of an accordion button, so it looks and behaves the
        // same: chevron at the start, hover, focus and active states.
        <Heading
          level={headingLevel}
          id={headingId}
          className="utrecht-accordion__header"
        >
          <Button
            appearance="subtle-button"
            className="utrecht-accordion__button"
            aria-expanded={open}
            aria-controls={contentId}
            onClick={() => setOpen(!open)}
          >
            <span className="utrecht-accordion__button-icon">
              <ChevronDownIcon />
            </span>
            <span className="utrecht-accordion__button-label">{heading}</span>
          </Button>
        </Heading>
      ) : (
        <Heading level={headingLevel} id={headingId}>
          {heading}
        </Heading>
      )}
      <div id={contentId} className="rhc-mox-card__content" hidden={!expanded}>
        {children}
      </div>
      {action}
    </section>
  );
};

export default Card;
