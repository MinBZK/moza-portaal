import {
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from "@/components/rhc";

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

/** Wat er kan: de regelingen, wat ze zijn en wie ze uitvoert. */
const Regelingen = () => (
  <>
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
  </>
);

export default Regelingen;
