import Card from "@/components/card";
import Link from "next/link";
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
        <h1 className="text-4xl">Publicatie niet gevonden</h1>
        <Card>
          <p className="text-neutral-600">
            Deze publicatie kon niet worden opgehaald.
          </p>
          <Link
            href="/berichteninuwbuurt"
            className="mt-4 inline-block text-[#01689b] underline"
          >
            &larr; Terug naar overzicht
          </Link>
        </Card>
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
      <Link
        href="/berichteninuwbuurt"
        className="text-sm text-[#01689b] underline"
      >
        &larr; Terug naar overzicht
      </Link>

      <h1 className="text-4xl">{publicatie.title || "Onbekende titel"}</h1>

      <Card className="space-y-5">
        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600">
          {publicatie.type && (
            <span className="rounded bg-[#d9ebf7] px-2 py-0.5 text-xs font-semibold text-[#154273]">
              {publicatie.type}
            </span>
          )}
          {publicatie.creator && <span>{publicatie.creator}</span>}
          {date && (
            <span>
              {date}
            </span>
          )}
        </div>

        {/* Details table */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          {publicatie.audience && (
            <>
              <dt className="font-semibold text-neutral-500">Doelgroep</dt>
              <dd>{publicatie.audience}</dd>
            </>
          )}
          {publicatie.subject && (
            <>
              <dt className="font-semibold text-neutral-500">Onderwerp</dt>
              <dd>{publicatie.subject}</dd>
            </>
          )}
          {publicatie.publicatienaam && (
            <>
              <dt className="font-semibold text-neutral-500">Bron</dt>
              <dd>{publicatie.publicatienaam}</dd>
            </>
          )}
          {publicatie.productArea && (
            <>
              <dt className="font-semibold text-neutral-500">Collectie</dt>
              <dd>{publicatie.productArea}</dd>
            </>
          )}
        </dl>

        {/* Postcodes */}
        {publicatie.postcodes.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {publicatie.postcodes.map((pc) => (
              <span
                key={pc}
                className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600"
              >
                {pc}
              </span>
            ))}
          </div>
        )}

        {/* Abstract */}
        {publicatie.abstract && (
          <p className="text-base leading-relaxed">{publicatie.abstract}</p>
        )}

        {/* External link */}
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded bg-[#154273] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0e2f54]"
          >
            {hasPreferredLink
              ? "Bekijk op officielebekendmakingen.nl"
              : "Bekijk op de website van de gemeente"}
            <span>↗</span>
          </a>
        )}
      </Card>
    </>
  );
};

export default PublicatieDetailPage;
