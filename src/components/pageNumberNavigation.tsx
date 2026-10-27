"use client";

import { useSyncExternalStore, type AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { PageNumberNavigation as RhcPageNumberNavigation } from "@rijkshuisstijl-community/page-number-navigation-react";

const NextLink = ({
  href = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => <Link href={href} {...props} />;

// Same breakpoint as the menu and rhc-grid.
const NARROW = "(width < 768px)";
const subscribeToScreen = (listener: () => void) => {
  const query = window.matchMedia(NARROW);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

const PageNumberNavigation = ({
  page,
  totalPages,
  maxVisiblePages,
  queryParam = "pagina",
  query,
}: {
  page: number;
  totalPages: number;
  maxVisiblePages?: number;
  /** Name of the query parameter in the link, for example "?pagina=2" */
  queryParam?: string;
  /** Other parameters that stay in the link, such as a filter. */
  query?: Record<string, string>;
}) => {
  // On a narrow screen as few page numbers as possible (5 is the component's
  // minimum), so the pagination fits on one line.
  const narrow = useSyncExternalStore(
    subscribeToScreen,
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
  return (
    <RhcPageNumberNavigation
      linkComponent={NextLink}
      linkTemplate={(pageNumber) =>
        `?${new URLSearchParams({ ...query, [queryParam]: String(pageNumber) })}`
      }
      maxVisiblePages={narrow ? 5 : maxVisiblePages}
      page={page}
      totalPages={totalPages}
    />
  );
};

export default PageNumberNavigation;
