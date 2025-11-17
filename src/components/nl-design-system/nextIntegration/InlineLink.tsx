import { Link as RhsLink } from "@rijkshuisstijl-community/components-react";
import NextLink from "next/link";

// Custom link that utilizes Next.js Link component with the NL Design System styles
export const InlineLink = (
  props: Omit<React.ComponentProps<typeof RhsLink>, "href"> & { href: string },
) => {
  return (
    <NextLink href={props.href} legacyBehavior passHref>
      <RhsLink {...props} />
    </NextLink>
  );
};
