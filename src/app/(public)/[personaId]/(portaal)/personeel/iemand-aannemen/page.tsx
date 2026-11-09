import type { Metadata } from "next";
import StepNavigation from "@/components/StepNavigation";
import {
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";
import Stappen from "./_stappen";
import { TAAK_TITEL } from "./_taakTitel";

export const metadata: Metadata = {
  title: "Lees wat er kan - Iemand aannemen - Personeel en rollen",
};

/** De regelingen die kunnen gelden: de naam, één zin en wie ze uitvoert. */
const REGELINGEN = [
  {
    naam: "Loonkostensubsidie",
    uitvoerder: "Gemeente",
    tekst:
      "De gemeente betaalt het verschil tussen wat uw werknemer kan en het minimumloon.",
  },
  {
    naam: "Loondispensatie",
    uitvoerder: "UWV",
    tekst:
      "U betaalt minder loon aan een werknemer met een Wajong-uitkering die minder kan.",
  },
  {
    naam: "Loonkostenvoordeel",
    uitvoerder: "Belastingdienst",
    tekst:
      "Een bedrag per verloond uur, voor iemand uit het doelgroepregister of met een doelgroepverklaring.",
  },
  {
    naam: "No-riskpolis",
    uitvoerder: "UWV",
    tekst:
      "Wordt uw werknemer ziek, dan betaalt UWV ziekengeld. U betaalt het loon door. U hoeft niets aan te vragen.",
  },
  {
    naam: "Jobcoaching",
    uitvoerder: "Gemeente of UWV",
    tekst: "Begeleiding op de werkplek.",
  },
  {
    naam: "Werkplekaanpassing",
    uitvoerder: "Gemeente of UWV",
    tekst: "Een aangepaste werkplek of een hulpmiddel voor uw werknemer.",
  },
  {
    naam: "Proefplaatsing",
    uitvoerder: "Gemeente of UWV",
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
      <Paragraph>
        Het doelgroepregister is een lijst van UWV met mensen die onder de
        banenafspraak vallen. Beschut werk is werk in een beschutte omgeving,
        voor iemand die alleen zo kan werken. De gemeente stelt vast wie op
        beschut werk is aangewezen.
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
        <div className="rhc-mox-table-container">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell scope="col">Regeling</TableHeaderCell>
                <TableHeaderCell scope="col">Wat het is</TableHeaderCell>
                <TableHeaderCell scope="col">Uitgevoerd door</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {REGELINGEN.map((r) => (
                <TableRow key={r.naam}>
                  <TableHeaderCell scope="row">{r.naam}</TableHeaderCell>
                  <TableCell>{r.tekst}</TableCell>
                  <TableCell>{r.uitvoerder}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
