import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";

export default async function FooterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Format slug to a readable title (optional, but nice)
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <>
      <Heading level={1}>{title}</Heading>
      <div className="mox-card">
        <Paragraph>Hier wordt aan gewerkt.</Paragraph>
        <Paragraph>
          <Link href="/" className="utrecht-link utrecht-link--html-a">
            Terug naar de startpagina
          </Link>
        </Paragraph>
      </div>
    </>
  );
}
