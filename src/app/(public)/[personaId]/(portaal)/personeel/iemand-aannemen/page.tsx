import type { Metadata } from "next";
import StepNavigation from "@/components/StepNavigation";
import { Heading, Paragraph } from "@/components/rhc";
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
 * De regelingen die kunnen gelden: wie ze uitvoert, de naam en één zin, en het
 * artikel op Ondernemersplein met de uitleg. Voor de no-riskpolis en de
 * loonkostensubsidie heeft Ondernemersplein geen eigen artikel; daar staat het
 * artikel waarin ze worden uitgelegd.
 */
const REGELINGEN = [
  {
    naam: "Loonkostensubsidie",
    uitvoerder: "Gemeente",
    dop: "82a0c04c-f0ea-4ac7-938c-a7b54b7af500",
    icoon: "currency-euro",
    tekst:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon.",
  },
  {
    naam: "Loondispensatie",
    uitvoerder: "UWV",
    dop: "78b2e9a9-b1c2-4fbc-b87a-30db8ec53311",
    icoon: "briefcase",
    tekst:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan.",
  },
  {
    naam: "Loonkostenvoordeel",
    uitvoerder: "Belastingdienst",
    dop: "4f1b7d5f-39b2-4bf5-84b2-bccf348178d2",
    icoon: "currency-euro",
    tekst:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring.",
  },
  {
    naam: "No-riskpolis",
    uitvoerder: "UWV",
    dop: "240d9f04-d033-4fad-88ea-e9bd545bedf7",
    icoon: "versleutelen",
    tekst:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. U hoeft niets aan te vragen.",
  },
  {
    naam: "Jobcoaching",
    uitvoerder: "Gemeente of UWV",
    dop: "213dc3bf-8f71-46d7-bf14-2bd2ef28e7b5",
    icoon: "user",
    tekst: "Begeleiding op de werkplek.",
  },
  {
    naam: "Werkplekaanpassing",
    uitvoerder: "Gemeente of UWV",
    dop: "e401cd8f-5d66-4d27-8324-5979ed6e1095",
    icoon: "instellingen",
    tekst: "Een aangepaste werkplek of een hulpmiddel voor uw werknemer.",
  },
  {
    naam: "Proefplaatsing",
    uitvoerder: "Gemeente of UWV",
    dop: "1a6e1684-135f-4523-9c91-212a76d49983",
    icoon: "kalender",
    tekst:
      "De kandidaat werkt eerst op proef bij u, zonder dat u loon betaalt.",
  },
] as const;

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
    uitvoerder: r.uitvoerder,
    tekst: r.tekst,
    icoon: r.icoon,
    artikel: naarPaneel(artikelen[i]),
  }));
  return (
    <>
      <Heading level={1}>{TAAK_TITEL}</Heading>
      <div className="rhc-mox-card rhc-mox-row-gap">
        <Stappen huidige={1} />
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
          <Paragraph>
            De regelingen worden uitgevoerd door UWV, de Belastingdienst en de
            gemeente. U hoeft niet te weten welke organisatie waarover gaat: wij
            vullen de aanvragen voor u in.
          </Paragraph>
          <Regelingen regelingen={regelingen} />
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

export default IemandAannemenPage;
