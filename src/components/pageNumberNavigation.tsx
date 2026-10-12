"use client";

import { useSyncExternalStore, type AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { PageNumberNavigation as RhcPageNumberNavigation } from "@rijkshuisstijl-community/page-number-navigation-react";

const NextLink = ({
  href = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => <Link href={href} {...props} />;

// Zelfde breekpunt als het menu en rhc-grid.
const SMAL = "(width < 768px)";
const luisterNaarScherm = (luisteraar: () => void) => {
  const query = window.matchMedia(SMAL);
  query.addEventListener("change", luisteraar);
  return () => query.removeEventListener("change", luisteraar);
};

const PageNumberNavigation = ({
  page,
  totalPages,
  maxVisiblePages,
  queryParam = "pagina",
}: {
  page: number;
  totalPages: number;
  maxVisiblePages?: number;
  /** Naam van de query-parameter in de link, bijvoorbeeld "?pagina=2" */
  queryParam?: string;
}) => {
  // Op een smal scherm zo min mogelijk paginanummers (5 is het minimum van
  // de component), zodat de paginering op één regel past.
  const smal = useSyncExternalStore(
    luisterNaarScherm,
    () => window.matchMedia(SMAL).matches,
    () => false,
  );
  return (
    <RhcPageNumberNavigation
      linkComponent={NextLink}
      linkTemplate={(pageNumber) => `?${queryParam}=${pageNumber}`}
      maxVisiblePages={smal ? 5 : maxVisiblePages}
      page={page}
      totalPages={totalPages}
    />
  );
};

export default PageNumberNavigation;
