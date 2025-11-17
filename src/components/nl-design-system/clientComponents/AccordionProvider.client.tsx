"use client";

import {
  AccordionProvider as RhsAccordionProvider,
  AccordionProviderProps,
} from "@rijkshuisstijl-community/components-react";

export const AccordionProvider = (props: AccordionProviderProps) => {
  return <RhsAccordionProvider {...props} />;
};

export type AccordionProps = AccordionProviderProps;
