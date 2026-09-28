import {
  Heading,
  Paragraph,
  Table,
  TableHeader,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableCaption,
  AccordionProvider,
  Separator,
  Link,
} from "@rijkshuisstijl-community/components-react";
import { getDemoZaken, getDemoZakenVragen } from "@/demo";

const AanvragenPage = async () => {
  const [zaken, vragen] = await Promise.all([
    getDemoZaken(),
    getDemoZakenVragen(),
  ]);

  return (
    <>
      <Heading level={1}>Lopende zaken</Heading>
      <Paragraph>
        Dit zijn uw aanvragen, vergunningen en meldingen bij de overheid. U ziet
        per zaak hoe ver het staat.
      </Paragraph>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell scope="col">Onderwerp</TableHeaderCell>
            <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
            <TableHeaderCell scope="col">Laatste wijziging</TableHeaderCell>
            <TableHeaderCell scope="col">Status</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zaken.map((zaak) => (
            <TableRow key={zaak.id}>
              <TableCell>
                <Link href="#">{zaak.onderwerp}</Link>
              </TableCell>
              <TableCell>{zaak.organisatie}</TableCell>
              <TableCell>{zaak.gewijzigd}</TableCell>
              <TableCell>
                {zaak.actieNodig ? `${zaak.status} (actie nodig)` : zaak.status}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Separator />

      <Heading level={2}>Veelgestelde vragen</Heading>
      <AccordionProvider
        sections={vragen.map(({ vraag, antwoord }) => ({
          label: vraag,
          body: <Paragraph>{antwoord}</Paragraph>,
        }))}
      />
    </>
  );
};

export default AanvragenPage;
