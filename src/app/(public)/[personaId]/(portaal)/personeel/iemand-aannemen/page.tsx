import type { Metadata } from "next";
import Link from "next/link";
import { ActionGroup, Heading, Icon, Paragraph } from "@/components/rhc";
import PageSearch from "@/layouts/search";
import {
  getDopArtikel,
  type DopArtikel,
} from "@/network/dop/opendata/getDopArtikel";
import Regelingen, { type PaneelArtikel } from "./_regelingen";
import Stappen from "./_stappen";
import { TAAK_TITEL } from "./_taakTitel";

export const metadata: Metadata = {
  title: "Lees wat er kan - Iemand aannemen - Personeel en rollen",
};

/**
 * De regelingen die kunnen gelden, elk in één zin, met wie ze uitvoert, en het
 * artikel op Ondernemersplein met de uitleg. Voor de no-riskpolis en de
 * loonkostensubsidie heeft Ondernemersplein geen eigen artikel; daar staat het
 * artikel waarin ze worden uitgelegd.
 */
const REGELINGEN = [
  {
    naam: "Loonkostensubsidie",
    dop: "82a0c04c-f0ea-4ac7-938c-a7b54b7af500",
    icoon: "currency-euro",
    tekst:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon. Gemeente.",
  },
  {
    naam: "Loondispensatie",
    dop: "78b2e9a9-b1c2-4fbc-b87a-30db8ec53311",
    icoon: "briefcase",
    tekst:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan. UWV.",
  },
  {
    naam: "Loonkostenvoordeel",
    dop: "4f1b7d5f-39b2-4bf5-84b2-bccf348178d2",
    icoon: "currency-euro",
    tekst:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring. Belastingdienst.",
  },
  {
    naam: "No-riskpolis",
    dop: "240d9f04-d033-4fad-88ea-e9bd545bedf7",
    icoon: "versleutelen",
    tekst:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. UWV, geen aanvraag nodig.",
  },
  {
    naam: "Jobcoaching",
    dop: "213dc3bf-8f71-46d7-bf14-2bd2ef28e7b5",
    icoon: "user",
    tekst: "Begeleiding op de werkplek. Gemeente of UWV.",
  },
  {
    naam: "Werkplekaanpassing",
    dop: "e401cd8f-5d66-4d27-8324-5979ed6e1095",
    icoon: "instellingen",
    tekst:
      "Een aangepaste werkplek of een hulpmiddel voor uw werknemer. Gemeente of UWV.",
  },
  {
    naam: "Proefplaatsing",
    dop: "1a6e1684-135f-4523-9c91-212a76d49983",
    icoon: "kalender",
    tekst:
      "De kandidaat werkt eerst op proef bij u, zonder dat u loon betaalt. Gemeente of UWV.",
  },
] as const;

const DOP =
  "https://ondernemersplein.overheid.nl/personeel/personeelskosten-en-loon/verlaag-uw-loonkosten-met-subsidies-en-tegemoetkomingen/";

const DATUM = new Intl.DateTimeFormat("nl-NL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Amsterdam",
});

/**
 * Het artikel voor in het zijpaneel. Het blok met de Regelhulp Financieel CV
 * valt weg: de voorbeeldberekening doet hier hetzelfde. De koppen schuiven een
 * niveau op, onder de titel van het paneel.
 */
const naarPaneel = (a: DopArtikel | null): PaneelArtikel | null => {
  if (!a?.articleBody || !a.url) return null;
  const html = a.articleBody
    .replace(/<aside[\s\S]*?<\/aside>/g, "")
    .replace(/<(\/?)h3\b/g, "<$1h4")
    .replace(/<(\/?)h2\b/g, "<$1h3");
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

/** Stap 1: wat er kan bij het aannemen van iemand met afstand tot de arbeidsmarkt. */
const IemandAannemenPage = async () => {
  const artikelen = await Promise.all(
    REGELINGEN.map((r) => getDopArtikel(r.dop)),
  );
  const regelingen = REGELINGEN.map((r, i) => ({
    naam: r.naam,
    tekst: r.tekst,
    icoon: r.icoon,
    artikel: naarPaneel(artikelen[i]),
  }));
  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <PageSearch />
      <div className="rhc-mox-card rhc-mox-row-gap">
        <Stappen huidige={1} />
        <Paragraph>
          Neemt u iemand aan die moeilijk aan werk komt, bijvoorbeeld door een
          arbeidsbeperking? Dan kunt u een deel van de loonkosten terugkrijgen
          en loopt u minder risico als uw werknemer ziek wordt. Welke regelingen
          gelden, hangt af van de kandidaat, bijvoorbeeld of die in het
          doelgroepregister staat.
        </Paragraph>
        <Paragraph>
          De regelingen worden uitgevoerd door UWV, de Belastingdienst en de
          gemeente. U hoeft niet te weten welke organisatie waarover gaat: wij
          vullen de aanvragen voor u in.
        </Paragraph>

        <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
          <Heading level={2} id="regelingen">
            Regelingen die kunnen gelden
          </Heading>
          <Regelingen regelingen={regelingen} />
          <ul className="rhc-mox-icon-list">
            <li>
              <a
                href={DOP}
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
        </section>

        <section className="rhc-mox-row-gap" aria-labelledby="oplevert">
          <Heading level={2} id="oplevert">
            Wat levert het u op?
          </Heading>
          <Paragraph>
            Reken uit wat een nieuwe werknemer u kost en wat de regelingen
            opleveren. Dat blijft op uw scherm; er gaat niets naar de overheid.
          </Paragraph>
          <ActionGroup>
            <Link
              href="/personeel/iemand-aannemen/voorbeeldberekening"
              className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action"
            >
              Maak een voorbeeldberekening
            </Link>
          </ActionGroup>
        </section>
      </div>
    </>
  );
};

export default IemandAannemenPage;
