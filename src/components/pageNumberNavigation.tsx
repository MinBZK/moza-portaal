"use client";

import type { AnchorHTMLAttributes } from "react";
import Link from "next/link";
import { PageNumberNavigation as RhcPageNumberNavigation } from "@rijkshuisstijl-community/page-number-navigation-react";

const NextLink = ({
  href = "",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) => <Link href={href} {...props} />;

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
}) => (
  <RhcPageNumberNavigation
    linkComponent={NextLink}
    linkTemplate={(pageNumber) => `?${queryParam}=${pageNumber}`}
    maxVisiblePages={maxVisiblePages}
    page={page}
    totalPages={totalPages}
  />
);

export default PageNumberNavigation;
