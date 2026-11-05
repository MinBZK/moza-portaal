import type { Metadata } from "next";
import Link from "next/link";
import { Heading, Paragraph } from "@/components/rhc";
import SiteSearch from "@/components/SiteSearch";

export const metadata: Metadata = { title: "Zoeken" };

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

/** Prototype: the query when none is given. */
const STANDAARD_ZOEKTERM = "afstand tot de arbeidsmarkt";

const ZoekenPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) => {
  const { q } = await searchParams;
  const zoekterm = (Array.isArray(q) ? q[0] : q)?.trim() || STANDAARD_ZOEKTERM;

  return (
    <>
      <Heading level={1} className="rhc-visually-hidden">
        Zoeken
      </Heading>

      <div className="rhc-mox-card">
        <SiteSearch
          key={zoekterm}
          label="Zoeken in MijnOverheid Zakelijk"
          hideLabel
          defaultValue={zoekterm}
        />
      </div>

      <section className="rhc-mox-card" aria-labelledby="zoekresultaten">
        <Heading level={2} id="zoekresultaten">
          {`${RESULTATEN.length} resultaten voor “${zoekterm}”`}
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
    </>
  );
};

export default ZoekenPage;
