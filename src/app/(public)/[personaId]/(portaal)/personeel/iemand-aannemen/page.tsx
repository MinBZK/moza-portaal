import type { Metadata } from "next";
import Link from "next/link";
import { ActionGroup, Heading, Icon, Paragraph } from "@/components/rhc";
import PageSearch from "@/layouts/search";
import Stappen from "./_stappen";
import { TAAK_TITEL } from "./_taakTitel";

export const metadata: Metadata = {
  title: "Lees wat er kan - Iemand aannemen - Personeel en rollen",
};

/** De regelingen die kunnen gelden, elk in één zin, met wie ze uitvoert. */
const REGELINGEN = [
  {
    naam: "Loonkostensubsidie",
    icoon: "currency-euro",
    tekst:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon. Gemeente.",
  },
  {
    naam: "Loondispensatie",
    icoon: "briefcase",
    tekst:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan. UWV.",
  },
  {
    naam: "Loonkostenvoordeel",
    icoon: "currency-euro",
    tekst:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring. Belastingdienst.",
  },
  {
    naam: "No-riskpolis",
    icoon: "versleutelen",
    tekst:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. UWV, geen aanvraag nodig.",
  },
  {
    naam: "Jobcoaching",
    icoon: "user",
    tekst: "Begeleiding op de werkplek. Gemeente of UWV.",
  },
  {
    naam: "Werkplekaanpassing",
    icoon: "instellingen",
    tekst:
      "Een aangepaste werkplek of een hulpmiddel voor uw werknemer. Gemeente of UWV.",
  },
  {
    naam: "Proefplaatsing",
    icoon: "kalender",
    tekst:
      "De kandidaat werkt eerst op proef bij u, zonder dat u loon betaalt. Gemeente of UWV.",
  },
] as const;

const DOP =
  "https://ondernemersplein.overheid.nl/personeel/personeelskosten-en-loon/verlaag-uw-loonkosten-met-subsidies-en-tegemoetkomingen/";

/** Stap 1: wat er kan bij het aannemen van iemand met afstand tot de arbeidsmarkt. */
const IemandAannemenPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <PageSearch />
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Stappen huidige={1} />
      <Paragraph>
        Neemt u iemand aan die moeilijk aan werk komt, bijvoorbeeld door een
        arbeidsbeperking? Dan kunt u een deel van de loonkosten terugkrijgen en
        loopt u minder risico als uw werknemer ziek wordt. Welke regelingen
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
        <ul className="rhc-mox-icon-list">
          {REGELINGEN.map((r) => (
            <li key={r.naam} className="rhc-mox-icon-list__item">
              <Icon icon={r.icoon} />
              <span className="rhc-mox-icon-list__text">
                <span className="rhc-mox-icon-list__title">{r.naam}</span>
                <span className="rhc-mox-small-text">{r.tekst}</span>
              </span>
            </li>
          ))}
        </ul>
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
                  Alle regelingen op een rij, op Ondernemersplein (opent in een
                  nieuw tabblad)
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

export default IemandAannemenPage;
