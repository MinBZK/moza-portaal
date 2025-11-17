"use client";

import {
  PageNumberNavigation as RhsPageNumberNavigation,
  PageNumberNavigationProps as RhsPageNumberNavigationProps,
} from "@rijkshuisstijl-community/components-react";

// Not possible to pass a function as prop from a server component to a client component
export type PageNumberNavigationProps = Omit<
  RhsPageNumberNavigationProps,
  "linkTemplate"
>;

export const PageNumberNavigation = (props: PageNumberNavigationProps) => {
  return (
    <RhsPageNumberNavigation
      linkTemplate={() => `some-url/${props.page}`}
      {...props}
    />
  );
};
