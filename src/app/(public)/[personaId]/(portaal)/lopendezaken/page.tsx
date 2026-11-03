import type { Metadata } from "next";
import { AccordionProvider, Heading, Paragraph } from "@/components/rhc";
import { getActievePersona } from "@/app/(public)/_persona";
import {
  getDemoConceptAanvragen,
  getDemoZaken,
  getDemoZakenVragen,
} from "@/demo";
import BewaardeAanvragen from "./_bewaardeAanvragen";
import ConceptAanvragen from "./_conceptAanvragen";
import ZakenTabel from "./_zakenTabel";
import ZakenTabs from "./_zakenTabs";

export const metadata: Metadata = { title: "Lopende zaken" };

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

      <ConceptAanvragen aanvragen={concepten} />

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
