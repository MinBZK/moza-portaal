import Link from "next/link";
import { Heading, Icon, Paragraph, VisuallyHidden } from "@/components/rhc";
import type { components } from "@/network/actualiteiten/generated";

type SruPublicatie = components["schemas"]["SruPublicatie"];

const isReadableUrl = (url: string) =>
  url && !url.endsWith(".xml") && !url.includes("/metadata/");

const PublicatieCard = ({ publicatie }: { publicatie: SruPublicatie }) => {
  const date = publicatie.modified
    ? new Date(publicatie.modified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const externalUrl = isReadableUrl(publicatie.preferredUrl ?? "")
    ? (publicatie.preferredUrl ?? "")
    : publicatie.bronUrl || "";
  const hasExternalLink = !!externalUrl;
  const description = publicatie.abstract || "";
  const detailHref = `/berichteninuwbuurt/${encodeURIComponent(publicatie.id)}`;

  return (
    <>
      <Heading level={3}>
        <Link href={detailHref} className="utrecht-link utrecht-link--html-a">
          {publicatie.title}
        </Link>
      </Heading>
      {(date || description) && (
        <Paragraph>
          {date}
          {date && description ? " — " : ""}
          {description}
        </Paragraph>
      )}
      {hasExternalLink && (
        <Paragraph>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="utrecht-link utrecht-link--html-a"
          >
            <Icon icon="externe-link" />
            Direct openen op officielebekendmakingen.nl
            <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
          </a>
        </Paragraph>
      )}
    </>
  );
};

export default PublicatieCard;
