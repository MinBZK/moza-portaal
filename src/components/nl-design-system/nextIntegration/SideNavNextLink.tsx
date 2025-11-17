import NextLink from "next/link";
import {
  SideNavLink as RhsSideNavLink,
  SideNavLinkProps,
} from "@rijkshuisstijl-community/components-react";

export const SideNavNextLink = ({
  href,
  disabled = false,
  ...props
}: SideNavLinkProps & { disabled?: boolean }) => {
  if (href == null) return null;

  return (
    <NextLink href={href} legacyBehavior passHref>
      <RhsSideNavLink {...props} className={disabled ? "opacity-50" : ""} />
    </NextLink>
  );
};
