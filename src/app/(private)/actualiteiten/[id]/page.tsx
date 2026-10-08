import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ActionGroup,
  DataSummary,
  DataSummaryItem,
  Heading,
  Icon,
  Link as RhcLink,
  Paragraph,
  UnorderedList,
  UnorderedListItem,
} from "@/components/rhc";
import dopOpenDataClient from "@/network/dop/opendata";
import { getKvkFromCookie } from "@/utils/kvknummer";
import { TYPE_LABELS } from "../_articleTypes";

const ArtikelDetailPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const kvk = await getKvkFromCookie();
  if (!kvk) redirect("/");

  const { id } = await params;

  const { data: article, error } = await dopOpenDataClient.GET(
    "/api/v1/articles/{id}",
    {
      params: { path: { id } },
    },
  );

  if (error || !article) {
    return (
      <>
        <Heading level={1}>
          {error ? "Fout bij ophalen artikel" : "Artikel niet gevonden"}
        </Heading>
        <div className="mox-card">
          <Paragraph>
            {error
              ? "Er is een fout opgetreden bij het ophalen van dit artikel. Probeer het later opnieuw."
              : "Dit artikel kon niet worden gevonden."}
          </Paragraph>
          <Paragraph>
            <Link
              href="/actualiteiten"
              className="utrecht-link utrecht-link--html-a"
            >
              &larr; Terug naar actualiteiten
            </Link>
          </Paragraph>
        </div>
      </>
    );
  }

  const date = article.dateModified
    ? new Date(article.dateModified).toLocaleDateString("nl-NL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const typeLabel =
    TYPE_LABELS[article.additionalType ?? ""] ?? article.additionalType;
  const authors = article.author?.map((a) => a.name).filter(Boolean) ?? [];

  return (
    <>
      <Paragraph>
        <Link
          href="/actualiteiten"
          className="utrecht-link utrecht-link--html-a"
        >
          &larr; Terug naar actualiteiten
        </Link>
      </Paragraph>

      <Heading level={1}>{article.headLine ?? "Onbekend artikel"}</Heading>

      <div className="mox-card">
        <DataSummary appearance="column">
          {typeLabel && (
            <DataSummaryItem itemKey="Soort" itemValue={typeLabel} />
          )}
          {authors.length > 0 && (
            <DataSummaryItem itemKey="Auteur" itemValue={authors.join(", ")} />
          )}
          {date && <DataSummaryItem itemKey="Datum" itemValue={date} />}
          {article.subjects && article.subjects.length > 0 && (
            <DataSummaryItem
              itemKey="Onderwerpen"
              itemValue={article.subjects.join(", ")}
            />
          )}
        </DataSummary>

        {article.about && <Paragraph purpose="lead">{article.about}</Paragraph>}

        {/* Artikeltekst is HTML uit de API */}
        {article.articleBody && (
          <div
            className="mox-rich-text"
            dangerouslySetInnerHTML={{ __html: article.articleBody }}
          />
        )}

        {article.hasPart && article.hasPart.length > 0 && (
          <>
            <Heading level={2}>Gerelateerde artikelen</Heading>
            <UnorderedList>
              {article.hasPart.map((part) => (
                <UnorderedListItem key={part.url}>
                  <RhcLink
                    href={part.url ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {part.headLine ?? part.url}
                  </RhcLink>
                </UnorderedListItem>
              ))}
            </UnorderedList>
          </>
        )}

        {article.url && (
          <ActionGroup>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              Bekijk op ondernemersplein.nl
              <Icon icon="externe-link" />
            </a>
          </ActionGroup>
        )}
      </div>
    </>
  );
};

export default ArtikelDetailPage;
