import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import { footerPages } from "@/layouts/footer";

/** The link text in the footer, or a title made from the address. */
const titleOf = (slug: string) =>
  footerPages.find(({ href }) => href === `/${slug}`)?.label ??
  slug.charAt(0).toUpperCase() + slug.slice(1).replaceAll("-", " ");

export const metadataOf = (slug: string): Metadata => ({
  title: titleOf(slug),
});

/** Placeholder for a page from the footer that has no content yet. */
const Placeholder = ({ slug }: { slug: string }) => (
  <>
    <Heading level={1}>{titleOf(slug)}</Heading>
    <div className="rhc-mox-card">
      <Paragraph>Wij werken aan deze pagina.</Paragraph>
      <Paragraph>
        <Link href="/" className="utrecht-link utrecht-link--html-a">
          <Icon icon="chevron-left" />
          Terug naar de startpagina
        </Link>
      </Paragraph>
    </div>
  </>
);

export default Placeholder;
