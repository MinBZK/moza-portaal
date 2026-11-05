import type { Metadata } from "next";
import Link from "next/link";
import {
  Button,
  FormFieldTextInput,
  Heading,
  Paragraph,
} from "@/components/rhc";

export const metadata: Metadata = { title: "Zoeken" };

/**
 * Prototype: whatever the search term, the same three results about hiring
 * someone with a distance to the labour market.
 */
const RESULTATEN = [
  {
    href: "/personeel/iemand-aannemen",
    titel: "Iemand aannemen met afstand tot de arbeidsmarkt",
    soort: "Aanvraag",
    tekst:
      "Beantwoord vier vragen en zie wat het u kost en oplevert. Daarna vullen wij de aanvragen bij UWV, de Belastingdienst en de gemeente voor u in.",
  },
  {
    href: "/subsidies/praktijkleren",
    titel: "Subsidieregeling praktijkleren",
    soort: "Subsidie",
    tekst:
      "Biedt u een leerwerkplek aan een leerling, student of werknemer die een opleiding volgt? Dan krijgt u tot €2.700 per leerplaats voor de begeleiding.",
  },
  {
    href: "/wetten/gelijke-kansen",
    titel: "Wet toezicht gelijke kansen bij werving en selectie",
    soort: "Wet en regelgeving",
    tekst:
      "Als werkgever legt u vast hoe u discriminatie voorkomt bij werving en selectie. Deze wet geldt sinds 1 juli 2026.",
  },
];

const ZoekenPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) => {
  const { q } = await searchParams;
  const zoekterm = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  return (
    <>
      <Heading level={1}>Zoeken</Heading>

      <search className="rhc-mox-card">
        <form
          action="/zoeken"
          method="get"
          className="rhc-mox-stack rhc-mox-stack--md"
        >
          <FormFieldTextInput
            label="Zoeken in MijnOverheid Zakelijk"
            name="q"
            type="search"
            defaultValue={zoekterm}
            autoComplete="off"
          />
          <Button type="submit" appearance="primary-action-button">
            Zoeken
          </Button>
        </form>
      </search>

      <section className="rhc-mox-card" aria-labelledby="zoekresultaten">
        <Heading level={2} id="zoekresultaten">
          {zoekterm
            ? `${RESULTATEN.length} resultaten voor “${zoekterm}”`
            : `${RESULTATEN.length} resultaten`}
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
