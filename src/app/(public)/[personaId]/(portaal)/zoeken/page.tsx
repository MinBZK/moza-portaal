import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import { getFlagsFromServerCookie } from "@/app/actions";
import PageSearch from "@/layouts/search";

type SearchParams = Promise<{ q?: string | string[] }>;

/**
 * Prototype: whatever the search term, the same three results about hiring
 * someone with a distance to the labour market.
 */
const RESULTATEN = [
  {
    href: "/personeel/iemand-aannemen",
    titel: "Iemand aannemen met afstand tot de arbeidsmarkt",
    soort: "Aanvragen",
    tekst:
      "Beantwoord vier vragen en zie wat het u kost en oplevert. Daarna vullen wij de aanvragen bij UWV, de Belastingdienst en de gemeente voor u in.",
  },
  {
    href: "/subsidies/praktijkleren",
    titel: "Subsidieregeling praktijkleren",
    soort: "Informeren",
    tekst:
      "Biedt u een leerwerkplek aan een leerling, student of werknemer die een opleiding volgt? Dan krijgt u tot €2.700 per leerplaats voor de begeleiding.",
  },
  {
    href: "/wetten/gelijke-kansen",
    titel: "Wet toezicht gelijke kansen bij werving en selectie",
    soort: "Informeren",
    tekst:
      "Als werkgever legt u vast hoe u discriminatie voorkomt bij werving en selectie. Deze wet geldt sinds 1 juli 2026.",
  },
];

const readQuery = async (searchParams: SearchParams) => {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
};

const countText = (query: string) =>
  query
    ? `${RESULTATEN.length} resultaten voor “${query}”`
    : `${RESULTATEN.length} resultaten`;

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const query = await readQuery(searchParams);
  return { title: query ? `${countText(query)} - Zoeken` : "Zoeken" };
};

const ZoekenPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const [query, flags] = await Promise.all([
    readQuery(searchParams),
    getFlagsFromServerCookie(),
  ]);

  return (
    <>
      <Heading level={1}>Zoeken</Heading>
      <PageSearch key={query} defaultValue={query} />

      <section className="rhc-mox-card" aria-labelledby="zoekresultaten">
        <Heading level={2} id="zoekresultaten">
          {countText(query)}
        </Heading>
        <ol className="rhc-mox-search-results">
          {RESULTATEN.map((resultaat) => (
            <li
              key={resultaat.href}
              className="rhc-mox-stack rhc-mox-stack--sm"
            >
              <Heading level={3}>
                <Link
                  href={resultaat.href}
                  className="utrecht-link utrecht-link--html-a"
                >
                  {resultaat.titel}
                </Link>
              </Heading>
              <Paragraph className="rhc-mox-small-text">
                {resultaat.soort}
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
