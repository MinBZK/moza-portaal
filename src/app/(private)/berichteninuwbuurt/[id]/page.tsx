import Link from "next/link";
import {
  ActionGroup,
  DataSummary,
  DataSummaryItem,
  Heading,
  Icon,
  Paragraph,
  VisuallyHidden,
} from "@/components/rhc";
import { getPublicatieById } from "@/network/sru/fetchers/getPublicatieById";

const isReadableUrl = (url: string) =>
  url && !url.endsWith(".xml") && !url.includes("/metadata/");

const PublicatieDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  const publicatie = await getPublicatieById(decodeURIComponent(id));

  if (!publicatie) {
    return (
      <>
        <Heading level={1}>Publicatie niet gevonden</Heading>
        <div className="mox-card">
          <Paragraph>Deze publicatie kon niet worden opgehaald.</Paragraph>
          <Paragraph>
            <Link
              href="/berichteninuwbuurt"
              className="utrecht-link utrecht-link--html-a"
            >
              &larr; Terug naar overzicht
            </Link>
          </Paragraph>
        </div>
      </>
    );
  }

  const date = publicatie.modified
    ? new Date(publicatie.modified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const hasPreferredLink = isReadableUrl(publicatie.preferredUrl);
  const hasBronLink = !!publicatie.bronUrl;
  const externalUrl = hasPreferredLink
    ? publicatie.preferredUrl
    : hasBronLink
      ? publicatie.bronUrl
      : "";

  return (
    <>
      <Paragraph>
        <Link
          href="/berichteninuwbuurt"
          className="utrecht-link utrecht-link--html-a"
        >
          &larr; Terug naar overzicht
        </Link>
      </Paragraph>

      <Heading level={1}>{publicatie.title || "Onbekende titel"}</Heading>

      <div className="mox-card">
        {publicatie.abstract && <Paragraph>{publicatie.abstract}</Paragraph>}

        <DataSummary appearance="column">
          {publicatie.type && (
            <DataSummaryItem itemKey="Soort" itemValue={publicatie.type} />
          )}
          {publicatie.creator && (
            <DataSummaryItem
              itemKey="Organisatie"
              itemValue={publicatie.creator}
            />
          )}
          {date && <DataSummaryItem itemKey="Datum" itemValue={date} />}
          {publicatie.audience && (
            <DataSummaryItem
              itemKey="Doelgroep"
              itemValue={publicatie.audience}
            />
          )}
          {publicatie.subject && (
            <DataSummaryItem
              itemKey="Onderwerp"
              itemValue={publicatie.subject}
            />
          )}
          {publicatie.publicatienaam && (
            <DataSummaryItem
              itemKey="Bron"
              itemValue={publicatie.publicatienaam}
            />
          )}
          {publicatie.productArea && (
            <DataSummaryItem
              itemKey="Collectie"
              itemValue={publicatie.productArea}
            />
          )}
          {publicatie.postcodes.length > 0 && (
            <DataSummaryItem
              itemKey="Postcodes"
              itemValue={publicatie.postcodes.join(", ")}
            />
          )}
        </DataSummary>

        {externalUrl && (
          <ActionGroup direction="row">
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              {hasPreferredLink
                ? "Bekijk op officielebekendmakingen.nl"
                : "Bekijk op de website van de gemeente"}
              <Icon icon="externe-link" />
              <VisuallyHidden> (opent in een nieuw tabblad)</VisuallyHidden>
            </a>
          </ActionGroup>
        )}
      </div>
    </>
  );
};

export default PublicatieDetailPage;
