import type { Metadata } from "next";
import StepNavigation from "@/components/StepNavigation";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import {
  getDopArtikel,
  type DopArtikel,
} from "@/network/dop/opendata/getDopArtikel";
import { BEGRIPPEN, type BegripId } from "../_begrippen";
import Regelingen, { type PaneelArtikel } from "../_regelingen";
import { TAAK_TITEL } from "../_taakTitel";

export const metadata: Metadata = {
  title:
    "Lees wat er kan - Regelingen bij het aannemen van iemand met afstand tot de arbeidsmarkt - Personeel en rollen",
};

/**
 * De regelingen die kunnen gelden, met het artikel op Ondernemersplein dat ze
 * uitlegt. Naam en zin komen uit de begrippen, zodat ze overal gelijk zijn.
 * Voor de no-riskpolis en de loonkostensubsidie heeft Ondernemersplein geen
 * eigen artikel; daar staat het artikel waarin ze worden uitgelegd.
 */
const REGELINGEN: { naam: string; begrip: BegripId; dop: string; icoon: string }[] = [
  {
    naam: "Loonkostensubsidie",
    begrip: "loonkostensubsidie",
    dop: "82a0c04c-f0ea-4ac7-938c-a7b54b7af500",
    icoon: "currency-euro",
  },
  {
    naam: "Loondispensatie",
    begrip: "loondispensatie",
    dop: "78b2e9a9-b1c2-4fbc-b87a-30db8ec53311",
    icoon: "briefcase",
  },
  {
    naam: "Loonkostenvoordeel",
    begrip: "loonkostenvoordeel",
    dop: "4f1b7d5f-39b2-4bf5-84b2-bccf348178d2",
    icoon: "currency-euro",
  },
  {
    naam: "No-riskpolis",
    begrip: "noRiskpolis",
    dop: "240d9f04-d033-4fad-88ea-e9bd545bedf7",
    icoon: "versleutelen",
  },
  {
    naam: "Jobcoaching",
    begrip: "jobcoaching",
    dop: "213dc3bf-8f71-46d7-bf14-2bd2ef28e7b5",
    icoon: "user",
  },
  {
    naam: "Werkplekaanpassing",
    begrip: "werkplekaanpassing",
    dop: "e401cd8f-5d66-4d27-8324-5979ed6e1095",
    icoon: "instellingen",
  },
  {
    naam: "Proefplaatsing",
    begrip: "proefplaatsing",
    dop: "1a6e1684-135f-4523-9c91-212a76d49983",
    icoon: "kalender",
  },
];

/** Het overzicht van alle regelingen op Ondernemersplein. */
const DOP_OVERZICHT =
  "https://ondernemersplein.overheid.nl/personeel/personeelskosten-en-loon/verlaag-uw-loonkosten-met-subsidies-en-tegemoetkomingen/";

const DATUM = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

/**
 * Het artikel voor in het zijpaneel. Het blok met de Regelhulp Financieel CV
 * valt weg: de voorbeeldberekening doet hier hetzelfde. De koppen schuiven twee
 * niveaus op, onder de titel van het paneel en de kop van de uitklap.
 */
const naarPaneel = (a: DopArtikel | null): PaneelArtikel | null => {
  if (!a?.articleBody || !a.url) return null;
  const html = a.articleBody
    .replace(/<aside[\s\S]*?<\/aside>/g, "")
    .replace(/<(\/?)h3\b/g, "<$1h5")
    .replace(/<(\/?)h2\b/g, "<$1h4");
  const bijgewerkt = a.dateModified ? new Date(a.dateModified) : undefined;
  return {
    titel: a.headLine ?? "Het artikel",
    html,
    url: a.url,
    bijgewerkt:
      bijgewerkt && !Number.isNaN(bijgewerkt.getTime())
        ? DATUM.format(bijgewerkt)
        : undefined,
  };
};

/**
 * Lees wat er kan: welke regelingen kunnen gelden, met de uitleg van
 * Ondernemersplein in een zijpaneel. Gaat vooraf aan de voorbeeldberekening.
 */
const UitlegPage = async () => {
  const artikelen = await Promise.all(
    REGELINGEN.map((r) => getDopArtikel(r.dop)),
  );
  const regelingen = REGELINGEN.map((r, i) => ({
    naam: r.naam,
    tekst: BEGRIPPEN[r.begrip].uitleg,
    door: BEGRIPPEN[r.begrip].door,
    icoon: r.icoon,
    artikel: naarPaneel(artikelen[i]),
  }));
  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card rhc-mox-row-gap">
        <Paragraph>
          Neemt u iemand aan die moeilijk aan werk komt, bijvoorbeeld door een
          arbeidsbeperking? Dan kunt u een deel van de loonkosten terugkrijgen
          en loopt u minder risico als uw werknemer ziek wordt. Welke regelingen
          gelden, hangt af van de kandidaat, bijvoorbeeld of die in het
          doelgroepregister staat.
        </Paragraph>

        <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
          <Heading level={2} id="regelingen">
            Regelingen die kunnen gelden
          </Heading>
          <Regelingen regelingen={regelingen} />
          <ul className="rhc-mox-icon-list">
            <li>
              <a
                href={DOP_OVERZICHT}
                className="rhc-mox-icon-list__item"
                target="_blank"
                rel="external noopener noreferrer"
              >
                <Icon icon="externe-link" />
                <span className="rhc-mox-icon-list__text">
                  <span className="rhc-mox-icon-list__title">
                    Verlaag uw loonkosten met subsidies en tegemoetkomingen
                  </span>
                  <span className="rhc-mox-small-text">
                    Alle regelingen op een rij, op Ondernemersplein (opent in
                    een nieuw tabblad)
                  </span>
                </span>
                <Icon icon="chevron-right" />
              </a>
            </li>
          </ul>
          <Paragraph className="rhc-mox-small-text">
            Bron:{" "}
            <a
              href="https://ondernemersplein.overheid.nl/"
              className="utrecht-link utrecht-link--html-a"
              target="_blank"
              rel="external noopener noreferrer"
            >
              Ondernemersplein (opent in een nieuw tabblad)
            </a>
          </Paragraph>
        </section>

        <StepNavigation
          next={{
            href: "/personeel/iemand-aannemen/voorbeeldberekening",
            label: "Maak een voorbeeldberekening",
          }}
        />
      </div>
    </>
  );
};

export default UitlegPage;
