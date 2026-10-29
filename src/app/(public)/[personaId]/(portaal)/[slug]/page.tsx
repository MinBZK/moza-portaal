import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Paragraph, Icon } from "@/components/rhc";

const titelVan = (slug: string) =>
  slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => ({ title: titelVan((await params).slug) });

export default async function FooterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const title = titelVan(slug);

  return (
    <>
      <Heading level={1}>{title}</Heading>
      <div className="rhc-mox-card">
        <Paragraph>Hier wordt aan gewerkt.</Paragraph>
        <Paragraph>
          <Link href="/" className="utrecht-link utrecht-link--html-a">
            <Icon icon="chevron-left" />
            Terug naar de startpagina
          </Link>
        </Paragraph>
      </div>
    </>
  );
}
