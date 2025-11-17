import { BreadcrumbNavLink as RhsBreadcrumbNavLink } from "@rijkshuisstijl-community/components-react";
import NextLink from "next/link";

const StyledNextLink = ({
  className,
  ...props
}: React.ComponentProps<typeof NextLink>) => {
  return (
    <NextLink
      className={`${className} utrecht-link utrecht-link--html-a`}
      {...props}
    />
  );
};

// Wrapper around Next.js Link component to be used in Rijkshuisstijl BreadcrumbNavLink
export const BreadcrumbNavLink = (
  props: React.ComponentProps<typeof RhsBreadcrumbNavLink> & { href: string },
) => {
  return <RhsBreadcrumbNavLink {...props} Link={StyledNextLink} />;
};
