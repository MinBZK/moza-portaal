"use client";

import React from "react";

import { usePathname } from "next/navigation";
import {
  BreadcrumbNav,
  BreadcrumbNavSeparator,
  Icon,
} from "@/components/nl-design-system";
import { BreadcrumbNavLink } from "@/components/nl-design-system/nextIntegration/BreadcrumbNavLink";

const Breadcrumb = () => {
  const paths = usePathname();
  const pathNames = paths.split("/").filter((path) => path);

  // Geen breadcrumbs op home page
  if (pathNames.length == 0) {
    return;
  }

  return (
    <BreadcrumbNav>
      <BreadcrumbNavLink href="/" index={0} rel="home">
        Home
      </BreadcrumbNavLink>

      {pathNames.map((link, index) => {
        const href = `/${pathNames.slice(0, index + 1).join("/")}`;
        const itemLink = link[0].toUpperCase() + link.slice(1, link.length);

        return (
          <React.Fragment key={index}>
            <BreadcrumbNavSeparator hidden={false}>
              <Icon icon="chevron-right" />
            </BreadcrumbNavSeparator>
            <BreadcrumbNavLink
              href={href}
              index={index + 1}
              current={index + 1 === pathNames.length}
            >
              {itemLink}
            </BreadcrumbNavLink>
          </React.Fragment>
        );
      })}
    </BreadcrumbNav>
  );
};

export default Breadcrumb;
