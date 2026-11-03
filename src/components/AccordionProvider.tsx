"use client";

import type { ComponentProps } from "react";
import { AccordionProvider as RhcAccordionProvider } from "@rijkshuisstijl-community/components-react/no-side-effects";
import { ChevronDownIcon } from "@/components/icons/chevronDownIcon";

/**
 * RHC AccordionProvider with our own chevron: decorative (aria-hidden) and
 * without the fixed ids of the Utrecht icon. Pass `icon` to use another one.
 */
export const AccordionProvider = ({
  icon = <ChevronDownIcon />,
  ...props
}: ComponentProps<typeof RhcAccordionProvider>) => (
  <RhcAccordionProvider icon={icon} {...props} />
);
