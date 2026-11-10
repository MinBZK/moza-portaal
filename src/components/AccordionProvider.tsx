"use client";

import { useState, type ComponentProps, type KeyboardEvent } from "react";
import {
  Accordion,
  AccordionProvider as RhcAccordionProvider,
  AccordionSection,
} from "@rijkshuisstijl-community/components-react/no-side-effects";
import { ChevronDownIcon } from "@/components/icons/chevronDownIcon";

type Props = ComponentProps<typeof RhcAccordionProvider> & {
  /** At most one section open: opening a section closes the others. */
  exclusive?: boolean;
};

/** Arrow keys, Home and End move between the buttons, as in RHC. */
const moveFocus = (event: KeyboardEvent<HTMLElement>) => {
  const buttons = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(
      ".utrecht-accordion__button",
    ),
  ];
  const current = buttons.indexOf(document.activeElement as HTMLElement);
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? buttons.length - 1
        : current < 0
          ? undefined
          : event.key === "ArrowDown"
            ? Math.min(current + 1, buttons.length - 1)
            : event.key === "ArrowUp"
              ? Math.max(current - 1, 0)
              : undefined;
  if (next === undefined) return;
  event.preventDefault();
  buttons[next]?.focus();
};

/**
 * RHC AccordionProvider with our own chevron: decorative (aria-hidden) and
 * without the fixed ids of the Utrecht icon. Pass `icon` to use another one.
 * With `exclusive` at most one section is open; RHC keeps the open state
 * inside its provider, so this variant keeps it itself.
 */
export const AccordionProvider = ({
  icon = <ChevronDownIcon />,
  exclusive = false,
  ...props
}: Props) => {
  const { sections, heading, headingLevel } = props;
  const [open, setOpen] = useState(() =>
    sections.findIndex((section) => section.expanded),
  );
  if (!exclusive) return <RhcAccordionProvider icon={icon} {...props} />;

  const sectionHeadingLevel =
    typeof headingLevel === "number"
      ? headingLevel + (heading ? 1 : 0)
      : undefined;
  return (
    <Accordion
      heading={heading}
      headingLevel={headingLevel}
      onKeyDown={moveFocus}
    >
      {sections.map((section, index) => (
        <AccordionSection
          key={index}
          headingLevel={sectionHeadingLevel}
          {...section}
          icon={icon}
          expanded={open === index}
          onActivate={() => setOpen(open === index ? -1 : index)}
        >
          {section.body}
        </AccordionSection>
      ))}
    </Accordion>
  );
};
