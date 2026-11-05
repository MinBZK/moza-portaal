import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import { getFlagsFromServerCookie } from "@/app/actions";
import { getDemoPersoneelsonderwerpen } from "@/demo";
import { ExternalLink } from "@/app/(footer)/_article";
import PageSearch from "@/layouts/search";
import TextBadge from "@/components/TextBadge";

type SearchParams = Promise<{ q?: string | string[] }>;

type Resultaat = {
  id: string;
  href?: string;
  titel: string;
  soort: string;
  tekst: string;
};

/**
 * Prototype: whatever the search term, the same results: the topics from
 * Personeel (those with an href link to a page in the portal or of the government), then two others.
 */
const OVERIGE_RESULTATEN: Resultaat[] = [
  {
    id: "praktijkleren",
    href: "/subsidies/praktijkleren",
    titel: "Subsidieregeling praktijkleren",
    soort: "Informeren",
    tekst:
      "Biedt u een leerwerkplek aan een leerling, student of werknemer die een opleiding volgt? Dan krijgt u tot €2.700 per leerplaats voor de begeleiding.",
  },
  {
    id: "gelijke-kansen",
    href: "/wetten/gelijke-kansen",
    titel: "Wet toezicht gelijke kansen bij werving en selectie",
    soort: "Informeren",
    tekst:
      "Als werkgever legt u vast hoe u discriminatie voorkomt bij werving en selectie. Deze wet geldt sinds 1 juli 2026.",
  },
];

const getResultaten = async (): Promise<Resultaat[]> => {
  const onderwerpen = await getDemoPersoneelsonderwerpen();
  return [
    ...onderwerpen.map(({ id, href, titel, samenvatting }) => ({
      id,
      href,
      titel,
      soort: "Personeel",
      tekst: samenvatting,
    })),
    ...OVERIGE_RESULTATEN,
  ];
};

/** Prototype: the query when none is given. */
const DEFAULT_QUERY = "afstand tot de arbeidsmarkt";

const readQuery = async (searchParams: SearchParams) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() || DEFAULT_QUERY;
};

const countText = (query: string, aantal: number) =>
  query ? `${aantal} resultaten voor “${query}”` : `${aantal} resultaten`;

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const [query, resultaten] = await Promise.all([
    readQuery(searchParams),
    getResultaten(),
  ]);
  return {
    title: query
      ? `${countText(query, resultaten.length)} - Zoekresultaten`
      : "Zoekresultaten",
  };
};

const ZoekenPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const [query, flags, resultaten] = await Promise.all([
    readQuery(searchParams),
    getFlagsFromServerCookie(),
    getResultaten(),
  ]);

  return (
    <>
      <Heading level={1}>Zoekresultaten</Heading>
      <PageSearch key={query} defaultValue={query} />

      <section className="rhc-mox-card" aria-labelledby="zoekresultaten">
        <Heading level={2} appearanceLevel={4} id="zoekresultaten">
          {query ? (
            <>
              {resultaten.length} resultaten voor “
              <span className="rhc-mox-semi-bold">{query}</span>”
            </>
          ) : (
            countText(query, resultaten.length)
          )}
        </Heading>
        <ol className="rhc-mox-search-results rhc-mox-stack rhc-mox-stack--3xl">
          {resultaten.map((resultaat) => (
            <li key={resultaat.id} className="rhc-mox-stack rhc-mox-stack--sm">
              <Heading level={3}>
                {resultaat.href?.startsWith("http") ? (
                  <ExternalLink href={resultaat.href}>
                    {resultaat.titel}
                  </ExternalLink>
                ) : resultaat.href ? (
                  <Link
                    href={resultaat.href}
                    className="utrecht-link utrecht-link--html-a"
                  >
                    {resultaat.titel}
                  </Link>
                ) : (
                  resultaat.titel
                )}
              </Heading>
              <Paragraph>
                <TextBadge>{resultaat.soort}</TextBadge>
              </Paragraph>
              <Paragraph>{resultaat.tekst}</Paragraph>
            </li>
          ))}
        </ol>
      </section>

      {query && flags.mox_digitaleAssistent && (
        <section className="rhc-mox-card" aria-labelledby="zoeken-assistent">
          <Heading level={2} id="zoeken-assistent">
            Hulp van de digitale assistent
          </Heading>
          <Paragraph>
            Staat het antwoord er niet bij? Stel uw vraag in uw eigen woorden.
          </Paragraph>
          <Paragraph>
            <Link
              href={`/digitale-assistent?vraag=${encodeURIComponent(query)}`}
              className="utrecht-link utrecht-link--html-a"
            >
              Vraag het de digitale assistent: “{query}”
            </Link>
          </Paragraph>
        </section>
      )}
    </>
  );
};

export default ZoekenPage;
