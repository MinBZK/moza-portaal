import Link from "next/link";
import {
  AccordionProvider,
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  VisuallyHidden,
  Button,
  Icon,
} from "@/components/rhc";
import { getActievePersona } from "@/app/(public)/_persona";
import {
  getDemoConceptAanvragen,
  getDemoZaken,
  getDemoZakenVragen,
} from "@/demo";
import BewaardeAanvragen from "./_bewaardeAanvragen";
import ZakenTabel from "./_zakenTabel";
import ZakenTabs from "./_zakenTabs";

const LopendeZakenPage = async () => {
  const persona = await getActievePersona();
  const [zaken, vragen, concepten] = await Promise.all([
    getDemoZaken("lopend"),
    getDemoZakenVragen(),
    getDemoConceptAanvragen(persona?.id),
  ]);

  return (
    <>
      <BewaardeAanvragen aanvragen={concepten} />
      <Heading level={1}>Lopende zaken</Heading>
      <div className="rhc-mox-card">
        <ZakenTabs actief="lopend" />
        <ZakenTabel zaken={zaken} soort="lopend" />
      </div>

      {concepten.length > 0 && (
        <section className="rhc-mox-card" aria-labelledby="nog-in-te-dienen">
          <Heading level={2} id="nog-in-te-dienen">
            Nog in te dienen aanvragen
          </Heading>
          <Paragraph>
            Deze aanvragen heeft u opgeslagen, maar nog niet ingediend.
            {/* Alleen een uiterste datum noemen als een aanvraag er een heeft. */}
            {concepten.some((aanvraag) => aanvraag.indienenVoor) &&
              " Dien ze in voor de uiterste datum."}
          </Paragraph>
          <div className="mox-table-container">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHeaderCell scope="col">Aanvraag</TableHeaderCell>
                  <TableHeaderCell scope="col">Organisatie</TableHeaderCell>
                  <TableHeaderCell scope="col">Tijdsduur</TableHeaderCell>
                  <TableHeaderCell scope="col">
                    <VisuallyHidden>Acties</VisuallyHidden>
                  </TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {concepten.map((aanvraag) => (
                  <TableRow key={aanvraag.id}>
                    <TableCell>{aanvraag.titel}</TableCell>
                    <TableCell>{aanvraag.organisatie}</TableCell>
                    <TableCell>{aanvraag.tijdsduur}</TableCell>
                    <TableCell>
                      <Link
                        href={`/lopendezaken/aanvragen/${aanvraag.id}`}
                        className="utrecht-link"
                      >
                        <Button appearance="subtle-button">
                          <Icon icon="bewerken" />
                          Bewerken
                        </Button>
                        <VisuallyHidden>: {aanvraag.titel}</VisuallyHidden>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      <Heading level={2}>Veelgestelde vragen</Heading>
      <div className="mox-faq-card">
        <AccordionProvider
          headingLevel={3}
          sections={vragen.map(({ vraag, antwoord }) => ({
            label: vraag,
            body: <Paragraph>{antwoord}</Paragraph>,
          }))}
        />
      </div>
    </>
  );
};

export default LopendeZakenPage;
