import { LinkListLink as RhsLinkListLink } from "@rijkshuisstijl-community/components-react";
import NextLink from "next/link";

export const LinkListLink = ({
  href,
  ...props
}: Omit<React.ComponentProps<typeof RhsLinkListLink>, "href"> & {
  href: string;
}) => {
  return (
    <NextLink href={href} legacyBehavior passHref>
      <RhsLinkListLink {...props} />
    </NextLink>
  );
};
