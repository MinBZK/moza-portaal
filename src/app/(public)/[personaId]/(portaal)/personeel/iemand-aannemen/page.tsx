import type { Metadata } from "next";
import StepNavigation from "@/components/StepNavigation";
import { Heading, Icon, Paragraph } from "@/components/rhc";
import Stappen from "./_stappen";
import { TAAK_TITEL } from "./_taakTitel";

export const metadata: Metadata = {
  title: "Lees wat er kan - Iemand aannemen - Personeel en rollen",
};

/** De regelingen die kunnen gelden: wie ze uitvoert, de naam en één zin. */
const REGELINGEN = [
  {
    naam: "Loonkostensubsidie",
    uitvoerder: "Gemeente",
    icoon: "currency-euro",
    tekst:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon.",
  },
  {
    naam: "Loondispensatie",
    uitvoerder: "UWV",
    icoon: "briefcase",
    tekst:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan.",
  },
  {
    naam: "Loonkostenvoordeel",
    uitvoerder: "Belastingdienst",
    icoon: "currency-euro",
    tekst:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring.",
  },
  {
    naam: "No-riskpolis",
    uitvoerder: "UWV",
    icoon: "versleutelen",
    tekst:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. U hoeft niets aan te vragen.",
  },
  {
    naam: "Jobcoaching",
    uitvoerder: "Gemeente of UWV",
    icoon: "user",
    tekst: "Begeleiding op de werkplek.",
  },
  {
    naam: "Werkplekaanpassing",
    uitvoerder: "Gemeente of UWV",
    icoon: "instellingen",
    tekst: "Een aangepaste werkplek of een hulpmiddel voor uw werknemer.",
  },
  {
    naam: "Proefplaatsing",
    uitvoerder: "Gemeente of UWV",
    icoon: "kalender",
    tekst:
      "De kandidaat werkt eerst op proef bij u, zonder dat u loon betaalt.",
  },
] as const;

/** Stap 1: wat er kan bij het aannemen van iemand met afstand tot de arbeidsmarkt. */
const IemandAannemenPage = () => (
  <>
    <Heading level={1}>{TAAK_TITEL}</Heading>
    <div className="rhc-mox-card rhc-mox-row-gap">
      <Stappen huidige={1} />
      <Paragraph>
        Neemt u iemand aan die moeilijk aan werk komt, bijvoorbeeld door een
        arbeidsbeperking? Dan kunt u een deel van de loonkosten terugkrijgen en
        loopt u minder risico als uw werknemer ziek wordt. Welke regelingen
        gelden, hangt af van de kandidaat, bijvoorbeeld of die in het
        doelgroepregister staat.
      </Paragraph>

      <section className="rhc-mox-row-gap" aria-labelledby="regelingen">
        <Heading level={2} id="regelingen">
          Regelingen die kunnen gelden
        </Heading>
        <Paragraph>
          De regelingen worden uitgevoerd door UWV, de Belastingdienst en de
          gemeente. U hoeft niet te weten welke organisatie waarover gaat: wij
          vullen de aanvragen voor u in.
        </Paragraph>
        <ul className="rhc-mox-icon-list">
          {REGELINGEN.map((r) => (
            <li key={r.naam} className="rhc-mox-icon-list__item">
              <Icon icon={r.icoon} />
              <span className="rhc-mox-icon-list__text">
                <span className="rhc-mox-small-text">{r.uitvoerder}</span>
                <span className="rhc-mox-icon-list__title">{r.naam}</span>
                <span className="rhc-mox-small-text">{r.tekst}</span>
              </span>
            </li>
          ))}
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

export default IemandAannemenPage;
